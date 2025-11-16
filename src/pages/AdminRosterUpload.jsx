import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Users, Check, X, AlertCircle, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminRosterUpload() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    state: '',
    sport: 'lacrosse',
    league: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedRoster, setParsedRoster] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadTeams();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        alert('Access denied. Admin only.');
        navigate(createPageUrl('Landing'));
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const allTeams = await base44.entities.Team.list();
      setTeams(allTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.team_name || !newTeam.state) {
      alert('Please fill in team name and state');
      return;
    }

    try {
      const created = await base44.entities.Team.create({
        team_name: newTeam.team_name,
        state: newTeam.state,
        sport: newTeam.sport,
        league: newTeam.league || '',
        player_count: 0,
        clip_count: 0
      });
      
      setTeams([...teams, created]);
      setSelectedTeam(created.id);
      setShowNewTeamForm(false);
      setNewTeam({ team_name: '', state: '', sport: 'lacrosse', league: '' });
      alert('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploadedFile(file);
    setProcessing(true);
    setParsedRoster([]);
    setUploadStatus(null);

    try {
      // Upload file first
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Extract data from CSV
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadResult.file_url,
        json_schema: {
          type: "object",
          properties: {
            roster: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  full_name: { type: "string" },
                  email: { type: "string" },
                  jersey_number: { type: "string" },
                  position: { type: "string" },
                  graduation_year: { type: "string" },
                  phone_number: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractResult.status === 'success' && extractResult.output?.roster) {
        setParsedRoster(extractResult.output.roster);
        setUploadStatus('success');
      } else {
        throw new Error(extractResult.details || 'Failed to parse CSV');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process CSV file. Make sure it has columns: full_name, email, jersey_number, position, graduation_year, phone_number');
      setUploadStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleImportRoster = async () => {
    if (!selectedTeam) {
      alert('Please select a team first');
      return;
    }

    if (parsedRoster.length === 0) {
      alert('No roster data to import');
      return;
    }

    setProcessing(true);

    try {
      const team = teams.find(t => t.id === selectedTeam);
      let successCount = 0;
      let errorCount = 0;

      for (const player of parsedRoster) {
        try {
          // Check if player already exists
          const existingProfiles = await base44.entities.PlayerProfile.filter({
            email: player.email
          });

          if (existingProfiles.length > 0) {
            console.log(`Player ${player.email} already exists, skipping`);
            continue;
          }

          // Create PlayerProfile
          await base44.entities.PlayerProfile.create({
            user_id: 'admin-created', // Special marker for admin-created profiles
            full_name: player.full_name,
            email: player.email,
            state: team.state,
            sport: team.sport,
            graduation_year: player.graduation_year,
            team_name: team.team_name,
            jersey_number: player.jersey_number,
            position: player.position || 'midfield',
            phone_number: player.phone_number || '',
            notification_preferences: {
              new_clips_email: true,
              tagged_in_clip: true,
              my_team_only: false
            },
            linked_parent_ids: [],
            pending_link_tokens: []
          });

          successCount++;
        } catch (error) {
          console.error(`Error creating profile for ${player.email}:`, error);
          errorCount++;
        }
      }

      // Update team player count
      await base44.entities.Team.update(selectedTeam, {
        player_count: (team.player_count || 0) + successCount
      });

      alert(`✅ Import complete!\n\nSuccessfully imported: ${successCount} players\nFailed: ${errorCount} players`);
      
      // Reset form
      setParsedRoster([]);
      setUploadedFile(null);
      setUploadStatus(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload teams
      loadTeams();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import roster. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `full_name,email,jersey_number,position,graduation_year,phone_number
John Smith,john.smith@example.com,23,attack,2026,(555) 123-4567
Sarah Johnson,sarah.j@example.com,15,midfield,2027,(555) 234-5678
Mike Williams,mike.w@example.com,7,defense,2025,(555) 345-6789`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster_template.csv';
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin: Roster Upload</h1>
          <p className="text-xl text-gray-300">Bulk import player rosters for team partnerships</p>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold mb-2">How It Works</h3>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Select or create a team</li>
                <li>Download the CSV template and fill it with player data</li>
                <li>Upload the completed CSV file</li>
                <li>Review the parsed data and import</li>
                <li>When players/parents sign up with matching info, they'll be prompted to link accounts</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Team Selection */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Step 1: Select Team</h2>
              
              {!showNewTeamForm ? (
                <>
                  <div className="mb-4">
                    <label className="text-white text-sm font-semibold mb-2 block">Choose Team</label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.team_name} - {team.state} ({team.player_count} players)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setShowNewTeamForm(true)}
                    variant="outline"
                    className="w-full border-white/20 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Team
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Team Name</label>
                      <Input
                        value={newTeam.team_name}
                        onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                        placeholder="Warriors Lacrosse"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">State</label>
                      <Select
                        value={newTeam.state}
                        onValueChange={(value) => setNewTeam({...newTeam, state: value})}
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

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Sport</label>
                      <Select
                        value={newTeam.sport}
                        onValueChange={(value) => setNewTeam({...newTeam, sport: value})}
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

                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">League (Optional)</label>
                      <Input
                        value={newTeam.league}
                        onChange={(e) => setNewTeam({...newTeam, league: e.target.value})}
                        placeholder="High School, Club, etc."
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowNewTeamForm(false)}
                      variant="outline"
                      className="flex-1 border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      Create Team
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* CSV Template Download */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Step 2: Get Template</h2>
              <p className="text-gray-300 text-sm mb-4">
                Download the CSV template and fill it with your roster data
              </p>
              <Button
                onClick={downloadSampleCSV}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>

          {/* Right Column: Upload & Preview */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Step 3: Upload Roster</h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#A88A86] transition-all"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">
                  {uploadedFile ? uploadedFile.name : 'Click to upload CSV file'}
                </p>
                <p className="text-gray-400 text-sm">
                  Required columns: full_name, email, jersey_number, position, graduation_year
                </p>
              </div>

              {processing && (
                <div className="mt-4 text-center text-gray-300">
                  Processing file...
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  Failed to process file. Please check the format and try again.
                </div>
              )}
            </div>

            {/* Roster Preview */}
            {parsedRoster.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Step 4: Review & Import</h2>
                  <div className="bg-green-500/20 px-3 py-1 rounded-full text-green-400 text-sm font-bold">
                    {parsedRoster.length} players
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
                  {parsedRoster.map((player, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{player.full_name}</div>
                          <div className="text-gray-400 text-xs">{player.email}</div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          <div>#{player.jersey_number} • {player.position}</div>
                          <div>Class of {player.graduation_year}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleImportRoster}
                  disabled={!selectedTeam || processing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 py-6 text-lg"
                >
                  {processing ? 'Importing...' : `Import ${parsedRoster.length} Players`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Teams Overview */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Existing Teams</h2>
          {teams.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No teams created yet</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {teams.map(team => (
                <div key={team.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-bold mb-1">{team.team_name}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>{team.state} • {team.sport}</div>
                    {team.league && <div>{team.league}</div>}
                    <div className="text-[#A88A86] font-semibold">{team.player_count} players</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}