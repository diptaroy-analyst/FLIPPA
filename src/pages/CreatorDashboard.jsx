import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Upload, DollarSign, TrendingUp, Video, Edit, Trash2, Eye, Plus, X, Calendar, Tag, BarChart3, PieChart, Folder as FolderIcon, FolderPlus, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [clipToMove, setClipToMove] = useState(null);
  
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: 'purple'
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.user_type !== 'creator') {
        navigate(createPageUrl('Store'));
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: myClips = [], isLoading } = useQuery({
    queryKey: ['myClips', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Clip.filter({ creator_email: user.email });
    },
    enabled: !!user,
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['myFolders', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allFolders = await base44.entities.Folder.filter({ creator_email: user.email });
      return allFolders.sort((a, b) => a.sort_order - b.sort_order);
    },
    enabled: !!user,
  });

  const { data: myEarnings = [] } = useQuery({
    queryKey: ['myEarnings', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Purchase.filter({ creator_email: user.email, status: 'completed' });
    },
    enabled: !!user,
  });

  const totalRevenue = myEarnings.reduce((sum, purchase) => sum + purchase.price_paid, 0);
  const totalSales = myEarnings.length;
  const avgClipPrice = myClips.length > 0 ? myClips.reduce((sum, clip) => sum + clip.price, 0) / myClips.length : 0;

  // Filter clips by selected folder
  const filteredClips = selectedFolder === 'all' 
    ? myClips
    : selectedFolder === 'unorganized'
    ? myClips.filter(clip => !clip.folder_id)
    : myClips.filter(clip => clip.folder_id === selectedFolder);

  // Analytics data
  const mostPopularClips = myClips
    .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
    .slice(0, 5);

  const clipTypeData = myClips.reduce((acc, clip) => {
    const type = clip.clip_type || 'other';
    if (!acc[type]) {
      acc[type] = { name: type.replace('_', ' ').toUpperCase(), count: 0, revenue: 0 };
    }
    acc[type].count += 1;
    acc[type].revenue += clip.total_revenue || 0;
    return acc;
  }, {});

  const clipTypeChartData = Object.values(clipTypeData);

  const monthlyData = myEarnings.reduce((acc, purchase) => {
    const date = new Date(purchase.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, revenue: 0, sales: 0 };
    }
    acc[monthKey].revenue += purchase.price_paid;
    acc[monthKey].sales += 1;
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => 
    a.month.localeCompare(b.month)
  ).slice(-6);

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  const folderColors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-amber-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-rose-500',
    pink: 'from-pink-500 to-fuchsia-500',
    gray: 'from-gray-500 to-slate-500'
  };

  const createFolderMutation = useMutation({
    mutationFn: async (folderData) => {
      return await base44.entities.Folder.create(folderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFolders'] });
      setShowFolderModal(false);
      setNewFolder({ name: '', description: '', color: 'purple' });
      alert('✅ Folder created!');
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Folder.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFolders'] });
      setShowFolderModal(false);
      setEditingFolder(null);
      setNewFolder({ name: '', description: '', color: 'purple' });
      alert('✅ Folder updated!');
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId) => {
      // First, move all clips in this folder to unorganized
      const clipsInFolder = myClips.filter(c => c.folder_id === folderId);
      for (const clip of clipsInFolder) {
        await base44.entities.Clip.update(clip.id, { folder_id: null });
      }
      return await base44.entities.Folder.delete(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFolders'] });
      queryClient.invalidateQueries({ queryKey: ['myClips'] });
      alert('✅ Folder deleted! Clips moved to unorganized.');
    },
  });

  const moveClipMutation = useMutation({
    mutationFn: async ({ clipId, folderId }) => {
      return await base44.entities.Clip.update(clipId, { folder_id: folderId || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myClips'] });
      setShowMoveModal(false);
      setClipToMove(null);
      alert('✅ Clip moved!');
    },
  });

  const deleteClipMutation = useMutation({
    mutationFn: async (clipId) => {
      return await base44.entities.Clip.delete(clipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myClips'] });
      alert('Clip deleted successfully!');
    },
  });

  const handleCreateFolder = () => {
    if (!newFolder.name.trim()) {
      alert('Please enter a folder name');
      return;
    }

    createFolderMutation.mutate({
      creator_email: user.email,
      name: newFolder.name,
      description: newFolder.description,
      color: newFolder.color,
      sort_order: folders.length
    });
  };

  const handleUpdateFolder = () => {
    if (!newFolder.name.trim()) {
      alert('Please enter a folder name');
      return;
    }

    updateFolderMutation.mutate({
      id: editingFolder.id,
      data: {
        name: newFolder.name,
        description: newFolder.description,
        color: newFolder.color
      }
    });
  };

  const handleDeleteFolder = (folder) => {
    if (confirm(`Delete folder "${folder.name}"? Clips will be moved to unorganized.`)) {
      deleteFolderMutation.mutate(folder.id);
    }
  };

  const handleMoveClip = (folderId) => {
    moveClipMutation.mutate({
      clipId: clipToMove.id,
      folderId: folderId === 'unorganized' ? null : folderId
    });
  };

  const handleDelete = async (clipId) => {
    if (confirm('Are you sure you want to delete this clip?')) {
      await deleteClipMutation.mutateAsync(clipId);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Creator Dashboard</h1>
            <p className="text-gray-300">Manage your clips and earnings</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('FileRenamer'))}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Clips
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Total Revenue</div>
                <div className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Total Sales</div>
                <div className="text-3xl font-bold text-white">{totalSales}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Active Clips</div>
                <div className="text-3xl font-bold text-white">{myClips.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Avg. Clip Price</div>
                <div className="text-3xl font-bold text-white">${avgClipPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Over Time */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenue Over Time
            </h2>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#ffffff60" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="sales" fill="#ec4899" name="Sales Count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>No sales data yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Clips by Type */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Clips by Type
            </h2>
            {clipTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={clipTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {clipTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>No clips yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Popular Clips */}
        {mostPopularClips.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              Top Performing Clips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {mostPopularClips.map((clip, index) => (
                <div key={clip.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="text-white font-semibold text-sm mb-2 line-clamp-2 mt-2">
                    {clip.title}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sales:</span>
                      <span className="text-white font-bold">{clip.total_sales || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue:</span>
                      <span className="text-green-400 font-bold">${(clip.total_revenue || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-[#A88A86] font-bold">${clip.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folders & Clips Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Clips</h2>
            <Button
              onClick={() => {
                setEditingFolder(null);
                setNewFolder({ name: '', description: '', color: 'purple' });
                setShowFolderModal(true);
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              New Folder
            </Button>
          </div>

          {/* Folder Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedFolder === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Clips ({myClips.length})
            </button>

            <button
              onClick={() => setSelectedFolder('unorganized')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedFolder === 'unorganized'
                  ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Unorganized ({myClips.filter(c => !c.folder_id).length})
            </button>

            {folders.map(folder => (
              <div key={folder.id} className="relative group">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    selectedFolder === folder.id
                      ? `bg-gradient-to-r ${folderColors[folder.color]} text-white`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FolderIcon className="w-4 h-4 inline mr-2" />
                  {folder.name} ({myClips.filter(c => c.folder_id === folder.id).length})
                </button>
                
                {/* Edit/Delete buttons on hover */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                      setNewFolder({
                        name: folder.name,
                        description: folder.description || '',
                        color: folder.color
                      });
                      setShowFolderModal(true);
                    }}
                    className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                    className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Clips Grid */}
          {filteredClips.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-24 h-24 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedFolder === 'all' ? 'No clips yet' : 'No clips in this folder'}
              </h3>
              <p className="text-gray-400 mb-4">
                {selectedFolder === 'all' 
                  ? 'Upload your first clip to start selling' 
                  : 'Move clips here to organize your content'}
              </p>
              <Button
                onClick={() => navigate(createPageUrl('FileRenamer'))}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Your First Clip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#A88A86] transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/40">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    {clip.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {formatDuration(clip.duration)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{clip.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <div className="text-gray-400">Price</div>
                        <div className="text-[#A88A86] font-bold">${clip.price}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Sales</div>
                        <div className="text-white font-bold">{clip.total_sales || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Revenue</div>
                        <div className="text-green-400 font-bold">${clip.total_revenue?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Rating</div>
                        <div className="text-yellow-400 font-bold">{clip.average_rating?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setClipToMove(clip);
                          setShowMoveModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20"
                      >
                        <MoveRight className="w-4 h-4 mr-1" />
                        Move
                      </Button>
                      <Button
                        onClick={() => window.open(clip.video_url, '_blank')}
                        variant="outline"
                        size="sm"
                        className="border-white/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(clip.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {editingFolder ? 'Edit Folder' : 'Create New Folder'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Folder Name *</label>
                <Input
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                  placeholder="e.g., Championship Games"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Description (optional)</label>
                <Textarea
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                  placeholder="What's in this folder..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(folderColors).map(([color, gradient]) => (
                    <button
                      key={color}
                      onClick={() => setNewFolder({...newFolder, color})}
                      className={`h-12 rounded-lg bg-gradient-to-r ${gradient} transition-all ${
                        newFolder.color === color ? 'ring-4 ring-white' : 'opacity-50 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <Button
                onClick={() => {
                  setShowFolderModal(false);
                  setEditingFolder(null);
                  setNewFolder({ name: '', description: '', color: 'purple' });
                }}
                variant="outline"
                className="flex-1 border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {editingFolder ? 'Update' : 'Create'} Folder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Move Clip Modal */}
      {showMoveModal && clipToMove && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Move Clip</h2>
              <p className="text-gray-400 text-sm mt-1">"{clipToMove.title}"</p>
            </div>

            <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
              <button
                onClick={() => handleMoveClip('unorganized')}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="text-white font-semibold">Unorganized</div>
                <div className="text-gray-400 text-sm">Move to unorganized clips</div>
              </button>

              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveClip(folder.id)}
                  disabled={clipToMove.folder_id === folder.id}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                    clipToMove.folder_id === folder.id
                      ? 'bg-green-500/20 border-green-500/50 cursor-default'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${folderColors[folder.color]}`} />
                    <div>
                      <div className="text-white font-semibold">{folder.name}</div>
                      {folder.description && (
                        <div className="text-gray-400 text-sm">{folder.description}</div>
                      )}
                    </div>
                    {clipToMove.folder_id === folder.id && (
                      <div className="ml-auto text-green-400 text-sm font-semibold">Current</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-white/10">
              <Button
                onClick={() => {
                  setShowMoveModal(false);
                  setClipToMove(null);
                }}
                variant="outline"
                className="w-full border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}