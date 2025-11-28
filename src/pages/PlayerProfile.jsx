// src/pages/PlayerProfile.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  User, Phone, Users, Calendar, Target, Hash, MapPin,
  Plus, X, Trophy, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

const GRAD_YEARS = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
const POSITIONS = ["attack", "midfield", "defense", "goalie", "fogo"];
const SPORTS = ["lacrosse", "field_hockey", "soccer", "basketball"];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

export default function PlayerProfile() {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setLocalUser] = useState(null);
  const [isParent, setIsParent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [teamSuggestions, setTeamSuggestions] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);

  const [playerProfiles, setPlayerProfiles] = useState([{
    full_name: "", email: "", state: "", graduation_year: "",
    team_name: "", jersey_number: "", position: "midfield",
    phone_number: "", sport: "lacrosse"
  }]);

  // Load user + teams
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setLocalUser(userData);
        setIsParent(userData.user_type === "parent");

        // Redirect if already completed (unless editing)
        if (userData.profile_completed && !window.location.search.includes("edit")) {
          navigate(createPageUrl("Marketplace"), { replace: true });
          return;
        }

        // Load teams for autocomplete
        const teams = await base44.entities.Team.list();
        setExistingTeams(teams);

        // Load existing profiles
        if (userData.player_profile_ids?.length > 0) {
          const profiles = await Promise.all(
            userData.player_profile_ids.map(id =>
              base44.entities.PlayerProfile.get(id).catch(() => null)
            )
          );
          const validProfiles = profiles.filter(Boolean);
          if (validProfiles.length > 0) {
            setPlayerProfiles(validProfiles);
            setDataConsent(true);
          }
        } else if (userData.user_type === "player") {
          setPlayerProfiles([{
            full_name: userData.full_name || "",
            email: userData.email,
            state: "", graduation_year: "", team_name: "",
            jersey_number: "", position: "midfield", phone_number: "", sport: "lacrosse"
          }]);
        }
      } catch (err) {
        toast.error("Session expired");
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  // Team autocomplete
  const handleTeamSearch = (index, value) => {
    updateProfile(index, "team_name", value);
    if (value.length < 2) {
      setTeamSuggestions([]);
      return;
    }
    const matches = existingTeams
      .filter(t => t.team_name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
    setTeamSuggestions(matches);
  };

  const selectTeam = (index, team) => {
    updateProfile(index, "team_name", team.team_name);
    updateProfile(index, "state", team.state);
    setTeamSuggestions([]);
  };

  const updateProfile = (index, field, value) => {
    setPlayerProfiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPlayer = () => {
    if (playerProfiles.length >= 5) {
      toast.error("Maximum 5 players per parent");
      return;
    }
    setPlayerProfiles(prev => [...prev, {
      full_name: "", email: "", state: "", graduation_year: "",
      team_name: "", jersey_number: "", position: "midfield",
      phone_number: "", sport: "lacrosse"
    }]);
  };

  const removePlayer = (index) => {
    if (playerProfiles.length === 1) {
      toast.error("At least one player required");
      return;
    }
    setPlayerProfiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const isValid = useMemo(() => {
    if (!dataConsent) return false;
    return playerProfiles.every(p =>
      p.full_name && p.email && p.state && p.graduation_year &&
      p.team_name && p.jersey_number && p.position
    );
  }, [playerProfiles, dataConsent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please complete all required fields");
      return;
    }

    setSaving(true);
    try {
      const profileIds = [];

      for (const profile of playerProfiles) {
        const payload = {
          user_id: user.id,
          full_name: profile.full_name.trim(),
          email: profile.email.toLowerCase().trim(),
          state: profile.state,
          sport: profile.sport,
          graduation_year: profile.graduation_year,
          team_name: profile.team_name.trim(),
          jersey_number: profile.jersey_number.trim(),
          position: profile.position,
          phone_number: profile.phone_number?.trim() || "",
          notification_preferences: {
            new_clips_email: true,
            tagged_in_clip: true,
            my_team_only: false
          },
          linked_parent_ids: isParent ? [user.id] : [],
        };

        let profileId;
        if (profile.id) {
          await base44.entities.PlayerProfile.update(profile.id, payload);
          profileId = profile.id;
        } else {
          const created = await base44.entities.PlayerProfile.create(payload);
          profileId = created.id;
        }
        profileIds.push(profileId);

        // Upsert team
        const existingTeam = existingTeams.find(t =>
          t.team_name.toLowerCase() === payload.team_name.toLowerCase() &&
          t.state === payload.state
        );

        if (existingTeam) {
          await base44.entities.Team.update(existingTeam.id, {
            player_count: (existingTeam.player_count || 0) + 1
          });
        } else {
          await base44.entities.Team.create({
            team_name: payload.team_name,
            state: payload.state,
            sport: payload.sport,
            player_count: 1,
            clip_count: 0
          });
        }

        // Trigger matching
        await base44.functions.invoke("checkProfileMatches", {
          playerProfileId: profileId,
          playerData: payload
        });
      }

      // Finalize user
      await base44.auth.updateMe({
        player_profile_ids: profileIds,
        data_consent: true,
        profile_completed: true
      });

      const freshUser = await base44.auth.me();
      setUser(freshUser);

      toast.success("Profile saved! Welcome to Flippa");
      navigate(createPageUrl("Marketplace"), { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#A88A86]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Urbanist', sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex p-6 rounded-full mb-6 ${
            isParent ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-gradient-to-br from-amber-500 to-orange-600"
          } shadow-2xl`}>
            {isParent ? <Users className="w-16 h-16 text-white" /> : <Trophy className="w-16 h-16 text-white" />}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {isParent ? "Set Up Your Players" : "Complete Your Profile"}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {isParent
              ? "Add your athletes so creators can tag them in highlights"
              : "Help creators find and tag you in game footage"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {playerProfiles.map((profile, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A88A86] to-[#d4a59a] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xl">{index + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {isParent ? `Player ${index + 1}` : "Your Info"}
                  </h2>
                  {profile.graduation_year && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                      Class of {profile.graduation_year}
                    </Badge>
                  )}
                </div>
                {isParent && playerProfiles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name & Email */}
                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#A88A86]" />
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={e => updateProfile(index, "full_name", e.target.value)}
                    placeholder="John Smith"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-12"
                    required
                  />
                </div>

                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={e => updateProfile(index, "email", e.target.value)}
                    placeholder="john@school.edu"
                    className="bg-white/10 border-white/20 text-white h-12"
                    disabled={!isParent && index === 0}
                    required
                  />
                </div>

                {/* State & Grad Year */}
                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A88A86]" />
                    State <span className="text-red-400">*</span>
                  </label>
                  <Select value={profile.state} onValueChange={v => updateProfile(index, "state", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A88A86]" />
                    Graduation Year <span className="text-red-400">*</span>
                  </label>
                  <Select value={profile.graduation_year} onValueChange={v => updateProfile(index, "graduation_year", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                      <SelectValue placeholder="Class of..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GRAD_YEARS.map(y => (
                        <SelectItem key={y} value={y}>Class of {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team with Autocomplete */}
                <div className="relative">
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A88A86]" />
                    Team Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={profile.team_name}
                    onChange={e => handleTeamSearch(index, e.target.value)}
                    placeholder="Warriors Lacrosse"
                    className="bg-white/10 border-white/20 text-white h-12"
                    required
                  />
                  {teamSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                      {teamSuggestions.map((team, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectTeam(index, team)}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium text-white">{team.team_name}</div>
                            <div className="text-xs text-gray-400">{team.state} • {team.player_count} players</div>
                          </div>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Jersey & Position */}
                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#A88A86]" />
                    Jersey # <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={profile.jersey_number}
                    onChange={e => updateProfile(index, "jersey_number", e.target.value)}
                    placeholder="23"
                    className="bg-white/10 border-white/20 text-white h-12 font-mono text-lg"
                    maxLength={3}
                    required
                  />
                </div>

                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#A88A86]" />
                    Position
                  </label>
                  <Select value={profile.position} onValueChange={v => updateProfile(index, "position", v)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(p => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone (Optional) */}
                <div className="md:col-span-2">
                  <label className="text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#A88A86]" />
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    value={profile.phone_number}
                    onChange={e => updateProfile(index, "phone_number", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-white/10 border-white/20 text-white h-12"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Player (Parents Only) */}
          {isParent && playerProfiles.length < 5 && (
            <div className="text-center">
              <Button
                type="button"
                onClick={addPlayer}
                size="lg"
                variant="outline"
                className="border-[#A88A86] text-[#A88A86] hover:bg-[#A88A86] hover:text-black font-bold px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Player ({playerProfiles.length}/5)
              </Button>
            </div>
          )}

          {/* Consent */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <Checkbox
                id="consent"
                checked={dataConsent}
                onCheckedChange={setDataConsent}
                className="mt-1 data-[state=checked]:bg-[#A88A86] data-[state=checked]:border-[#A88A86]"
              />
              <label htmlFor="consent" className="text-white leading-relaxed cursor-pointer">
                <strong className="text-[#A88A86]">I consent</strong> to storing this player information in Flippa's database. 
                This enables creators to tag players in highlights and sends notifications when they're featured. 
                {isParent && " As a parent/guardian, I have authority to provide consent for all listed players."}
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center gap-4">
            <Button
              type="submit"
              disabled={!isValid || saving}
              size="lg"
              className="w-full max-w-md bg-gradient-to-r from-[#A88A86] to-[#d4a59a] hover:from-[#9a7a76] hover:to-[#c49387] text-black font-bold text-xl py-8 rounded-2xl shadow-2xl disabled:opacity-50"
            >
              {saving ? (
                <>Saving Profiles...</>
              ) : (
                <>Complete Setup & Enter Flippa</>
              )}
            </Button>
            <p className="text-gray-400 text-sm">
              You can edit this anytime in Settings
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}