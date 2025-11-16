import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Phone, Users, Calendar, Target, Hash, MapPin, Plus, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PlayerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [isParent, setIsParent] = useState(false);
  const [playerProfiles, setPlayerProfiles] = useState([{
    full_name: '',
    email: '',
    state: '',
    sport: 'lacrosse',
    graduation_year: '',
    team_name: '',
    jersey_number: '',
    position: '',
    phone_number: ''
  }]);
  const [dataConsent, setDataConsent] = useState(false);
  const [teamSuggestions, setTeamSuggestions] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);

  useEffect(() => {
    loadUser();
    loadExistingTeams();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setIsParent(userData.user_type === 'parent');

      // If profile is already completed, redirect to store
      if (userData.profile_completed && !window.location.search.includes('edit')) {
        navigate(createPageUrl('Store'));
        return;
      }

      // Load existing player profiles if editing
      if (userData.player_profile_ids && userData.player_profile_ids.length > 0) {
        const profiles = [];
        for (const profileId of userData.player_profile_ids) {
          try {
            const allProfiles = await base44.entities.PlayerProfile.list();
            const profile = allProfiles.find(p => p.id === profileId);
            if (profile) {
              profiles.push(profile);
            }
          } catch (error) {
            console.log('Could not load profile:', profileId);
          }
        }
        if (profiles.length > 0) {
          setPlayerProfiles(profiles);
          setDataConsent(true); // Already consented if profiles exist
        }
      } else if (userData.user_type === 'player') {
        // Pre-fill with user email for player
        setPlayerProfiles([{
          full_name: userData.full_name || '',
          email: userData.email,
          state: '',
          sport: 'lacrosse',
          graduation_year: '',
          team_name: '',
          jersey_number: '',
          position: '',
          phone_number: ''
        }]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const loadExistingTeams = async () => {
    try {
      const teams = await base44.entities.Team.list();
      setExistingTeams(teams);
    } catch (error) {
      console.log('Could not load teams:', error);
    }
  };

  const handleTeamInput = (index, value) => {
    updatePlayerProfile(index, 'team_name', value);
    
    // Filter team suggestions
    if (value.length >= 2) {
      const matches = existingTeams.filter(team => 
        team.team_name.toLowerCase().includes(value.toLowerCase())
      );
      setTeamSuggestions(matches.slice(0, 5));
    } else {
      setTeamSuggestions([]);
    }
  };

  const selectTeamSuggestion = (index, team) => {
    updatePlayerProfile(index, 'team_name', team.team_name);
    updatePlayerProfile(index, 'state', team.state);
    setTeamSuggestions([]);
  };

  const updatePlayerProfile = (index, field, value) => {
    const updated = [...playerProfiles];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerProfiles(updated);
  };

  const addPlayerProfile = () => {
    if (playerProfiles.length >= 5) {
      alert('Parents can manage up to 5 player profiles');
      return;
    }
    setPlayerProfiles([...playerProfiles, {
      full_name: '',
      email: '',
      state: '',
      sport: 'lacrosse',
      graduation_year: '',
      team_name: '',
      jersey_number: '',
      position: '',
      phone_number: ''
    }]);
  };

  const removePlayerProfile = (index) => {
    if (playerProfiles.length === 1) {
      alert('You must have at least one player profile');
      return;
    }
    setPlayerProfiles(playerProfiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dataConsent) {
      alert('Please consent to data storage to continue');
      return;
    }

    // Validate all profiles
    for (const profile of playerProfiles) {
      if (!profile.full_name || !profile.email || !profile.state || !profile.graduation_year || 
          !profile.team_name || !profile.jersey_number) {
        alert('Please fill in all required fields for all player profiles');
        return;
      }
    }

    setSaving(true);

    try {
      const createdProfileIds = [];

      for (const profile of playerProfiles) {
        // Create or update PlayerProfile
        const profileData = {
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          state: profile.state,
          sport: profile.sport,
          graduation_year: profile.graduation_year,
          team_name: profile.team_name,
          jersey_number: profile.jersey_number,
          position: profile.position || 'midfield',
          phone_number: profile.phone_number || '',
          notification_preferences: {
            new_clips_email: true,
            tagged_in_clip: true,
            my_team_only: false
          },
          linked_parent_ids: isParent ? [user.id] : [],
          pending_link_tokens: []
        };

        let createdProfile;
        if (profile.id) {
          // Update existing profile
          await base44.entities.PlayerProfile.update(profile.id, profileData);
          createdProfile = { id: profile.id, ...profileData };
        } else {
          // Create new profile
          createdProfile = await base44.entities.PlayerProfile.create(profileData);
        }
        
        createdProfileIds.push(createdProfile.id);

        // Create or update Team entity
        try {
          const existingTeam = existingTeams.find(
            t => t.team_name.toLowerCase() === profile.team_name.toLowerCase() &&
                 t.state.toLowerCase() === profile.state.toLowerCase()
          );

          if (existingTeam) {
            await base44.entities.Team.update(existingTeam.id, {
              player_count: (existingTeam.player_count || 0) + 1
            });
          } else {
            await base44.entities.Team.create({
              team_name: profile.team_name,
              state: profile.state,
              sport: profile.sport,
              player_count: 1,
              clip_count: 0
            });
          }
        } catch (error) {
          console.log('Could not create/update team:', error);
        }

        // Call backend function to check for profile matches and send linking emails
        try {
          await base44.functions.invoke('checkProfileMatches', {
            playerProfileId: createdProfile.id,
            playerData: profileData
          });
        } catch (error) {
          console.log('Could not check for matches:', error);
        }
      }

      // Update user record
      await base44.auth.updateMe({
        player_profile_ids: createdProfileIds,
        data_consent: true,
        profile_completed: true
      });

      navigate(createPageUrl('Store'));
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${isParent ? 'from-green-500 to-emerald-500' : 'from-amber-500 to-orange-500'} flex items-center justify-center mx-auto mb-4`}>
            {isParent ? <Users className="w-10 h-10 text-white" /> : <User className="w-10 h-10 text-white" />}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isParent ? 'Setup Player Profiles' : 'Complete Your Player Profile'}
          </h1>
          <p className="text-xl text-gray-300">
            {isParent 
              ? 'Enter your children\'s information to manage their clips' 
              : 'Help creators tag you in game clips'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {playerProfiles.map((profile, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#A88A86]" />
                  {isParent ? `Player ${index + 1}` : 'Your Info'}
                </h2>
                {isParent && playerProfiles.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePlayerProfile(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#A88A86]" />
                    Full Name *
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => updatePlayerProfile(index, 'full_name', e.target.value)}
                    placeholder="John Smith"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#A88A86]" />
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updatePlayerProfile(index, 'email', e.target.value)}
                    placeholder="player@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                    disabled={!isParent && index === 0}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A88A86]" />
                    State *
                  </label>
                  <Select
                    value={profile.state}
                    onValueChange={(value) => updatePlayerProfile(index, 'state', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sport */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#A88A86]" />
                    Sport *
                  </label>
                  <Select
                    value={profile.sport}
                    onValueChange={(value) => updatePlayerProfile(index, 'sport', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lacrosse">Lacrosse</SelectItem>
                      <SelectItem value="field_hockey">Field Hockey</SelectItem>
                      <SelectItem value="soccer">Soccer</SelectItem>
                      <SelectItem value="basketball">Basketball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A88A86]" />
                    Graduation Year *
                  </label>
                  <Select
                    value={profile.graduation_year}
                    onValueChange={(value) => updatePlayerProfile(index, 'graduation_year', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'].map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#A88A86]" />
                    Position *
                  </label>
                  <Select
                    value={profile.position || 'midfield'}
                    onValueChange={(value) => updatePlayerProfile(index, 'position', value)}
                    required
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attack">Attack</SelectItem>
                      <SelectItem value="midfield">Midfield</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="goalie">Goalie</SelectItem>
                      <SelectItem value="fogo">FOGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Name with Autocomplete */}
                <div className="relative">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A88A86]" />
                    Team Name *
                  </label>
                  <Input
                    value={profile.team_name}
                    onChange={(e) => handleTeamInput(index, e.target.value)}
                    placeholder="Warriors Lacrosse"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                  {teamSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {teamSuggestions.map((team, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectTeamSuggestion(index, team)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                        >
                          <div className="font-semibold">{team.team_name}</div>
                          <div className="text-xs text-gray-400">{team.state} • {team.player_count} players</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Jersey Number */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#A88A86]" />
                    Jersey Number *
                  </label>
                  <Input
                    type="text"
                    value={profile.jersey_number}
                    onChange={(e) => updatePlayerProfile(index, 'jersey_number', e.target.value)}
                    placeholder="23"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div className="md:col-span-2">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#A88A86]" />
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => updatePlayerProfile(index, 'phone_number', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Player Button (Parent Only) */}
          {isParent && playerProfiles.length < 5 && (
            <div className="text-center">
              <Button
                type="button"
                onClick={addPlayerProfile}
                variant="outline"
                className="border-[#A88A86] text-[#A88A86] hover:bg-[#A88A86] hover:text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Player ({playerProfiles.length}/5)
              </Button>
            </div>
          )}

          {/* Data Consent */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <div className="flex items-start gap-4">
              <Checkbox
                id="consent"
                checked={dataConsent}
                onCheckedChange={setDataConsent}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-white text-sm cursor-pointer">
                I consent to having this player information stored in the Flippa database. This allows creators 
                to tag players in clips, and players to be notified when they're featured in footage. 
                {isParent && ' As a parent/guardian, I have the authority to provide this consent on behalf of the player(s).'}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={saving || !dataConsent}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Complete Profile & Continue'}
          </Button>

          <p className="text-center text-gray-400 text-sm">
            You can update this information later in your account settings
          </p>
        </form>
      </div>
    </div>
  );
}