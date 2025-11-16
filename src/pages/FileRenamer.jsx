
import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, FileText, Play, Pause, X, Star, Sliders, Tag, GripVertical, Home, Scissors, Edit, Plus } from "lucide-react";
import FileUploadZone from "../components/renamer/FileUploadZone";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function FileRenamer() {
  const queryClient = useQueryClient();

  const [files, setFiles] = useState([]);
  // REMOVED: const [namingPattern, setNamingPattern] = useState([]);
  const [fileNamingPatterns, setFileNamingPatterns] = useState({}); // New state for per-file naming patterns
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState({});
  // REMOVED: presetApplied - no longer needed as a global flag
  const [currentTab, setCurrentTab] = useState('home');
  const [zoomLevel, setZoomLevel] = useState('fit');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activeOrganizerTab, setActiveOrganizerTab] = useState('layout1');
  const [leftPanelWidth, setLeftPanelWidth] = useState(240); // Reduced from 280
  const [rightPanelWidth, setRightPanelWidth] = useState(240); // Reduced from 280
  const [filesPanelHeight, setFilesPanelHeight] = useState(140); // Reduced from 180

  const [lutFile, setLutFile] = useState(null);
  const [lutData, setLutData] = useState(null);
  const [lutIntensity, setLutIntensity] = useState(100);
  const lutInputRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [trimSegments, setTrimSegments] = useState([]);
  const [inPoint, setInPoint] = useState(null);
  const [outPoint, setOutPoint] = useState(null);
  const [showEDLModal, setShowEDLModal] = useState(false);
  const [edlContent, setEdlContent] = useState('');

  const [playbackRate, setPlaybackRate] = useState(1);
  const [lastKeyPressed, setLastKeyPressed] = useState(null);
  const [reverseInterval, setReverseInterval] = useState(null);

  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const [sellClipMode, setSellClipMode] = useState(false);
  const [showUploadSummary, setShowUploadSummary] = useState(false);
  const [sellSelectedFiles, setSellSelectedFiles] = useState([]);
  const [clipTitle, setClipTitle] = useState('');
  const [clipDescription, setClipDescription] = useState('');
  const [clipPrice, setClipPrice] = useState(5);
  const [clipType, setClipType] = useState('goal');
  const [clipTags, setClipTags] = useState([]);
  const [isGeneratingClipInfo, setIsGeneratingClipInfo] = useState(false);
  const [currentSellFileIndex, setCurrentSellFileIndex] = useState(0);
  const [uploadingClip, setUploadingClip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFileName: '' });
  const [uploadComplete, setUploadComplete] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [useBatchPricing, setUseBatchPricing] = useState(true);
  const [batchPrice, setBatchPrice] = useState(5);
  const [individualPrices, setIndividualPrices] = useState({});

  const [exportSelectedFiles, setExportSelectedFiles] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, isDownloading: false });

  const [editMode, setEditMode] = useState(false);
  const [showLayoutCreator, setShowLayoutCreator] = useState(false);
  const [newLayoutForm, setNewLayoutForm] = useState({
    name: '',
    sections: [
      { title: 'SECTION 1', buttons: [{ label: 'Button 1' }] }
    ]
  });

  const [layoutConfigs, setLayoutConfigs] = useState(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('flippa_layout_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure that default programGradYearPlayerNumbers exists for all layouts
        // And ensure custom buttons have unique 'value' if not already set
        Object.keys(parsed).forEach(layoutKey => {
          if (!parsed[layoutKey].programGradYearPlayerNumbers) {
            parsed[layoutKey].programGradYearPlayerNumbers = {};
          }
          // Check if sections exists before trying to iterate
          if (parsed[layoutKey].sections && Array.isArray(parsed[layoutKey].sections)) {
            parsed[layoutKey].sections.forEach(section => {
              // Check if buttons exists before trying to iterate
              if (section.buttons && Array.isArray(section.buttons)) {
                section.buttons.forEach(button => {
                  // Ensure custom buttons have a 'value' property and for custom ones, it's their label
                  // If it's a custom button, and its value is still the ID (from previous versions) or missing, update it to its label
                  if (button.id && button.id.startsWith('custom_') && (button.value === button.id || !button.value)) {
                    button.value = button.label;
                  }
                });
              }
            });
          } else {
            // If sections doesn't exist, initialize it
            parsed[layoutKey].sections = [];
          }
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse layout configs from localStorage, using default:', e);
        // Clear corrupted localStorage
        localStorage.removeItem('flippa_layout_configs');
      }
    }
    return {
      layout1: {
        name: 'Layout 1',
        programGradYearPlayerNumbers: {},
        sections: [
          {
            id: 'program',
            title: 'PROGRAM',
            buttons: [
              { id: 'home', label: 'HOME', value: 'home', type: 'program' },
              { id: 'away', label: 'AWAY', value: 'away', type: 'program' }
            ]
          },
          {
            id: 'gradyear',
            title: 'GRAD YEAR',
            buttons: [
              { id: '2025', label: '2025', value: '2025', type: 'gradyear' },
              { id: '2026', label: '2026', value: '2026', type: 'gradyear' },
              { id: '2027', label: '2027', value: '2027', type: 'gradyear' },
              { id: '2028', label: '2028', value: '2028', type: 'gradyear' }
            ]
          },
          {
            id: 'shot',
            title: 'SHOT',
            buttons: [
              { id: 'broll', label: 'BROLL', value: 'broll', type: 'shot' },
              { id: 'goal', label: 'GOAL', value: 'goal', type: 'shot' },
              { id: 'save', label: 'SAVE', value: 'save', type: 'shot' },
              { id: 'faceoff', label: 'FACEOFF', value: 'faceoff', type: 'shot' }
            ]
          },
          {
            id: 'players',
            title: 'PLAYER #',
            buttons: []
          },
          {
            id: 'rating',
            title: 'RATING',
            buttons: [
              { id: '1star', label: '1★', value: '1star', type: 'rating' },
              { id: '2star', label: '2★', value: '2star', type: 'rating' },
              { id: '3star', label: '3★', value: '3star', type: 'rating' } // Fixed typo: '3star' to '3★'
            ]
          }
        ]
      },
      layout2: {
        name: 'Layout 2',
        programGradYearPlayerNumbers: {},
        sections: []
      },
      layout3: {
        name: 'Layout 3',
        programGradYearPlayerNumbers: {},
        sections: []
      }
    };
  });

  const [selectedProgramForPlayers, setSelectedProgramForPlayers] = useState(null);
  const [selectedGradYearForPlayers, setSelectedGradYearForPlayers] = useState(null);

  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const viewerRef = useRef(null);
  const folderInputRef = useRef(null);
  const timelineRef = useRef(null);

  // Helper to get the current file's naming pattern
  const getCurrentNamingPattern = () => {
    if (selectedFileIndex === null || !files[selectedFileIndex]) return [];
    return fileNamingPatterns[files[selectedFileIndex].id] || [];
  };

  // Helper to set the current file's naming pattern
  const setCurrentNamingPattern = (pattern) => {
    if (selectedFileIndex === null || !files[selectedFileIndex]) return;
    setFileNamingPatterns(prev => ({
      ...prev,
      [files[selectedFileIndex].id]: pattern
    }));
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setPermissions({ max_files: -1, max_markers: 100 }); // Changed to unlimited for beta
      } catch (error) {
        setUser({ email: 'demo@example.com', id: 'demo' });
        setPermissions({ max_files: -1, max_markers: 100 }); // Changed to unlimited for beta
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('flippa_layout_configs');
    if (saved) {
      try {
        setLayoutConfigs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load layout configs:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flippa_layout_configs', JSON.stringify(layoutConfigs));
  }, [layoutConfigs]);

  const updateLayoutName = (layoutKey, newName) => {
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: { ...prev[layoutKey], name: newName }
    }));
  };

  const updateSectionTitle = (layoutKey, sectionId, newTitle) => {
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: {
        ...prev[layoutKey],
        sections: prev[layoutKey].sections.map(section =>
          section.id === sectionId ? { ...section, title: newTitle } : section
        )
      }
    }));
  };

  const updateButtonLabel = (layoutKey, sectionId, buttonId, newLabel) => {
    setLayoutConfigs(prev => {
      // Find the old button's properties before updating it in layoutConfigs
      const oldSection = prev[layoutKey].sections.find(s => s.id === sectionId);
      const oldButton = oldSection?.buttons.find(b => b.id === buttonId);
      
      const newLayoutConfigs = {
        ...prev,
        [layoutKey]: {
          ...prev[layoutKey],
          sections: prev[layoutKey].sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  buttons: section.buttons.map(btn =>
                    btn.id === buttonId ? { ...btn, label: newLabel, value: newLabel } : btn
                  )
                }
              : section
          )
        }
      };

      // Now, update the currently selected file's naming pattern if this button was part of it
      // The previous value (oldButton?.value) should be matched
      // The new value (newLabel) should be set
      // Apply this change only if there's a selected file and its pattern exists
      if (selectedFileIndex !== null && files[selectedFileIndex]) {
        setCurrentNamingPattern(prevPatternForSelectedFile =>
          prevPatternForSelectedFile.map(component => {
            // If the component in the naming pattern was derived from this specific button
            // Match by type and old value (if available), otherwise by type and label if value was missing/same as id
            if (component.type === oldSection?.id && component.value === (oldButton?.value || oldButton?.id)) {
              return { ...component, label: newLabel, value: newLabel }; // Update its label AND value
            }
            return component;
          })
        );
      }

      return newLayoutConfigs;
    });
  };

  const addCustomButton = (layoutKey, sectionId) => {
    const newButtonId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Ensure unique ID
    const newButtonLabel = 'NEW'; // default label
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: {
        ...prev[layoutKey],
        sections: prev[layoutKey].sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                buttons: [
                  ...section.buttons,
                  { id: newButtonId, label: newButtonLabel, value: newButtonLabel, type: section.id }
                ]
              }
            : section
        )
      }
    }));
  };

  const removeCustomButton = (layoutKey, sectionId, buttonId) => {
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: {
        ...prev[layoutKey],
        sections: prev[layoutKey].sections.map(section =>
          section.id === sectionId
            ? { ...section, buttons: section.buttons.filter(btn => btn.id !== buttonId) }
            : section
        )
      }
    }));
  };

  const addCustomSection = (layoutKey) => {
    const newSectionId = `section_${Date.now()}`;
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: {
        ...prev[layoutKey],
        sections: [
          ...prev[layoutKey].sections,
          { id: newSectionId, title: 'NEW SECTION', buttons: [] }
        ]
      }
    }));
  };

  const removeCustomSection = (layoutKey, sectionId) => {
    setLayoutConfigs(prev => ({
      ...prev,
      [layoutKey]: {
        ...prev[layoutKey],
        sections: prev[layoutKey].sections.filter(section => section.id !== sectionId)
      }
    }));
  };

  const getPlayerNumbersForProgramAndGradYear = (program, gradYear) => {
    const currentLayout = layoutConfigs[activeOrganizerTab];
    if (!currentLayout || !currentLayout.programGradYearPlayerNumbers) return ['', '', '', '', '', ''];
    
    const programData = currentLayout.programGradYearPlayerNumbers[program] || {};
    const numbers = programData[gradYear] || [];
    return [...numbers, ...Array(Math.max(0, 6 - numbers.length)).fill('')];
  };

  const setPlayerNumbersForProgramAndGradYear = (program, gradYear, numbers) => {
    setLayoutConfigs(prev => ({
      ...prev,
      [activeOrganizerTab]: {
        ...prev[activeOrganizerTab],
        programGradYearPlayerNumbers: {
          ...(prev[activeOrganizerTab].programGradYearPlayerNumbers || {}), // Ensure programGradYearPlayerNumbers is initialized
          [program]: {
            ...(prev[activeOrganizerTab].programGradYearPlayerNumbers[program] || {}),
            [gradYear]: numbers.filter(n => n !== '')
          }
        }
      }
    }));
  };

  const addPlayerNumberForProgramAndGradYear = (program, gradYear, number) => {
    if (!number || number.trim() === '') return;
    if (!program || !gradYear) {
      alert('Please select both a program and grad year first');
      return;
    }

    const cleanNumber = number.trim();
    const currentNumbers = getPlayerNumbersForProgramAndGradYear(program, gradYear).filter(n => n !== '');
    
    // Create unique value for this player
    const playerValue = `${program}-${gradYear}-#${cleanNumber}`;

    if (currentNumbers.includes(cleanNumber)) {
      // If number already exists in saved list, just toggle it in the naming pattern
      toggleNamingComponent({ 
        type: 'player', 
        label: `#${cleanNumber}`, // Label simplified for display
        value: playerValue        // Use the unique playerValue
      });
      return;
    }

    setPlayerNumbersForProgramAndGradYear(program, gradYear, [...currentNumbers, cleanNumber]);
    toggleNamingComponent({ 
      type: 'player', 
      label: `#${cleanNumber}`, // Label simplified for display
      value: playerValue        // Use the unique playerValue
    });
  };

  const removePlayerNumberForProgramAndGradYear = (program, gradYear, index) => {
    const currentNumbers = getPlayerNumbersForProgramAndGradYear(program, gradYear).filter(n => n !== '');
    const numberToRemove = currentNumbers[index];
    const newNumbers = currentNumbers.filter((_, i) => i !== index);

    setPlayerNumbersForProgramAndGradYear(program, gradYear, newNumbers);

    const playerValue = `${program}-${gradYear}-#${numberToRemove}`;
    const existingInPattern = getCurrentNamingPattern().find(
      c => c.type === 'player' && c.value === playerValue
    );
    if (existingInPattern) {
      removeNamingComponent(existingInPattern.id);
    }
  };

  // Modified handlers to use exact button labels in naming pattern
  const handleProgramButtonClick = (button) => {
    toggleNamingComponent({ 
      type: 'program', 
      label: button.label, 
      value: button.label  // Use exact label as value in naming pattern
    });
    setSelectedProgramForPlayers(button.value); // Keep this as button.value for consistency with player numbers
  };

  const handleGradYearButtonClick = (button) => {
    toggleNamingComponent({ 
      type: 'gradyear', 
      label: button.label, 
      value: button.label  // Use exact label as value in naming pattern
    });
    setSelectedGradYearForPlayers(button.value); // Keep this as button.value for consistency with player numbers
  };

  const handleShotButtonClick = (button) => {
    toggleNamingComponent({ 
      type: 'shot', 
      label: button.label, 
      value: button.label  // Use exact label as value in naming pattern
    });
  };

  const handleRatingButtonClick = (button) => {
    toggleNamingComponent({ 
      type: button.type, 
      label: button.label, 
      value: button.label  // Use exact label as value in naming pattern
    });
  };

  const handleGenericButtonClick = (button) => {
    toggleNamingComponent({ 
      type: button.type, 
      label: button.label, 
      value: button.label  // Use exact label as value in naming pattern
    });
  };

  const selectedFile = selectedFileIndex !== null ? files[selectedFileIndex] : null;
  const isImage = selectedFile?.originalFile?.type?.startsWith('image/');
  const isVideo = selectedFile?.originalFile?.type?.startsWith('video/');

  const generateThumbnailAndMetadata = useCallback((file) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        try {
          video.src = '';
          video.load();
          video.remove();
        } catch (e) {}
      };

      const timeoutId = setTimeout(cleanup, 3000);

      video.addEventListener('loadedmetadata', () => {
        clearTimeout(timeoutId);
        try {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, frameRate: '30.00 fps', colorSpace: 'Rec. 709' } : f
          ));
          video.currentTime = Math.min(0.1, video.duration / 4);
        } catch (error) {
          cleanup();
        }
      }, { once: true });

      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 90;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6);
            setThumbnails(prev => ({ ...prev, [file.id]: thumbnailUrl }));
          }
        } catch (error) {
        } finally {
          cleanup();
        }
      }, { once: true });

      video.addEventListener('error', () => {
        clearTimeout(timeoutId);
        cleanup();
      }, { once: true });

      video.src = file.url;
      video.load();
    } catch (error) {}
  }, []);

  const handleFilesAdded = useCallback((newFiles) => {
    try {
      if (!newFiles || newFiles.length === 0) return;

      const filesArray = Array.from(newFiles);
      const filesWithMetadata = filesArray.map((file, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        originalFile: file,
        originalName: file.name,
        extension: file.name.split('.').pop(),
        nameWithoutExt: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        counter: files.length + index + 1,
        url: URL.createObjectURL(file)
      }));

      setFiles(prev => [...prev, ...filesWithMetadata]);

      if (selectedFileIndex === null && filesWithMetadata.length > 0) {
        setSelectedFileIndex(0);
      }

      if (currentTab === 'home') {
        setCurrentTab('edit');
      }

      filesWithMetadata.forEach((file, index) => {
        if (file.originalFile.type.startsWith('video/')) {
          setTimeout(() => generateThumbnailAndMetadata(file), 200 * (index + 1));
        }
      });
    } catch (error) {
      console.error('Error adding files:', error);
      alert('Failed to add files. Please try again.');
    }
  }, [files.length, selectedFileIndex, currentTab, generateThumbnailAndMetadata]);

  const handleFilesAddedWithLimit = useCallback((newFiles) => {
    const maxFiles = permissions?.max_files || 10;
    const currentCount = files.length;
    const newCount = Array.from(newFiles).length;

    if (maxFiles !== -1 && currentCount + newCount > maxFiles) {
      const availableSlots = Math.max(0, maxFiles - currentCount);
      alert(`You can only upload ${maxFiles} files. Upgrade for more!`);

      if (availableSlots > 0) {
        const allowedFiles = Array.from(newFiles).slice(0, availableSlots);
        handleFilesAdded(allowedFiles);
      }
      return;
    }

    handleFilesAdded(newFiles);
  }, [permissions, files.length, handleFilesAdded]);

  // Modified useEffect: Apply preset when file is first selected in labeling tab
  useEffect(() => {
    if (currentTab === 'labeling' && selectedFileIndex !== null && files[selectedFileIndex]) {
      const selectedFile = files[selectedFileIndex];
      
      // Only apply preset if this specific file doesn't have a pattern yet
      if (!fileNamingPatterns[selectedFile.id] || fileNamingPatterns[selectedFile.id].length === 0) {
        const fileDate = new Date(selectedFile.originalFile.lastModified);
        const yymmdd = fileDate.getFullYear().toString().slice(-2) +
                       (fileDate.getMonth() + 1).toString().padStart(2, '0') +
                       fileDate.getDate().toString().padStart(2, '0');

        setFileNamingPatterns(prev => ({
          ...prev,
          [selectedFile.id]: [
            { id: Math.random().toString(36).substr(2, 9), type: 'date', label: yymmdd, value: yymmdd },
            { id: Math.random().toString(36).substr(2, 9), type: 'original', label: 'ORIGINAL', value: '' }
          ]
        }));
      }
    }
  }, [currentTab, selectedFileIndex, files, fileNamingPatterns]); // Dependencies updated

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (reverseInterval) {
        clearInterval(reverseInterval);
        setReverseInterval(null);
      }

      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setPlaybackRate(0);
      } else {
        if (playbackRate === 0 || videoRef.current.playbackRate === 0) {
          setPlaybackRate(1);
          videoRef.current.playbackRate = 1;
        }
        videoRef.current.play();
        setIsPlaying(true);
      }
      setLastKeyPressed(isPlaying ? 'k' : ' ');
    }
  }, [isPlaying, playbackRate, reverseInterval]);

  const setInPointAtCurrent = useCallback(() => {
    if (!selectedFile || !isVideo) return;
    setInPoint(currentTime);
  }, [selectedFile, isVideo, currentTime]);

  const setOutPointAtCurrent = useCallback(() => {
    if (!selectedFile || !isVideo || !videoRef.current) return;
    if (inPoint === null) {
      setInPoint(0);
    }
    setOutPoint(videoRef.current.currentTime);
  }, [selectedFile, isVideo, inPoint]);

  const addTrimSegment = () => {
    if (!selectedFile || !isVideo) {
      alert('Please select a video file first.');
      return;
    }

    if (inPoint === null || outPoint === null) {
      alert('Please set both IN and OUT points.');
      return;
    }

    if (inPoint >= outPoint) {
      alert('IN point must be before OUT point.');
      return;
    }

    const newSegment = {
      id: Math.random().toString(36).substr(2, 9),
      fileId: selectedFile.id,
      start: inPoint,
      end: outPoint,
      name: `Segment ${trimSegments.filter(s => s.fileId === selectedFile.id).length + 1}`,
      duration: outPoint - inPoint
    };

    setTrimSegments(prev => [...prev, newSegment]);
    setInPoint(null);
    setOutPoint(null);
    
    alert(`✅ Segment added! Duration: ${formatTime(newSegment.duration)}`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (files.length === 0) return;

      if (selectedFile && isVideo && videoRef.current) {
        if (e.key === ' ') {
          e.preventDefault();
          togglePlayPause();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - (1/30));
          setCurrentTime(videoRef.current.currentTime);
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          if (reverseInterval) {
            clearInterval(reverseInterval);
            setReverseInterval(null);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (duration > 0) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + (1/30));
            setCurrentTime(videoRef.current.currentTime);
          }
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          if (reverseInterval) {
            clearInterval(reverseInterval);
            setReverseInterval(null);
          }
        } else if (e.key.toLowerCase() === 'j') {
          e.preventDefault();
          videoRef.current.pause();
          setIsPlaying(false);

          if (reverseInterval) {
            clearInterval(reverseInterval);
            setReverseInterval(null);
          }

          let speed = 1;
          if (lastKeyPressed === 'j') {
            speed = 2;
          }
          setPlaybackRate(-speed);

          const interval = setInterval(() => {
            if (videoRef.current) {
              const frameTime = (1 / 30) * speed;
              const newTime = Math.max(0, videoRef.current.currentTime - frameTime);
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);

              if (newTime === 0) {
                clearInterval(interval);
                setReverseInterval(null);
                setPlaybackRate(0);
                videoRef.current.pause();
              }
            }
          }, 1000 / 30);

          setReverseInterval(interval);
          setLastKeyPressed('j');
        } else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            setPlaybackRate(0);
            videoRef.current.playbackRate = 1;
            setLastKeyPressed('k');

            if (reverseInterval) {
              clearInterval(reverseInterval);
              setReverseInterval(null);
            }
          }
        } else if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          if (videoRef.current) {
            if (reverseInterval) {
              clearInterval(reverseInterval);
              setReverseInterval(null);
            }

            let newRate = 1;
            if (lastKeyPressed === 'l') {
              newRate = 2;
            }

            setPlaybackRate(newRate);
            videoRef.current.playbackRate = newRate;
            videoRef.current.play();
            setIsPlaying(true);
            setLastKeyPressed('l');
          }
        }

        if (currentTab === 'edit' || currentTab === 'trim') { // Now also check for 'edit' tab
          if (e.key === 'i' || e.key === 'I') {
            e.preventDefault();
            setInPointAtCurrent();
          } else if (e.key === 'o' || e.key === 'O') {
            e.preventDefault();
            setOutPointAtCurrent();
          }
        }
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setSelectedFileIndex(prev => {
            if (files.length === 0) return null;
            if (prev === null) return 0;
            return prev < files.length - 1 ? prev + 1 : prev;
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelectedFileIndex(prev => {
            if (files.length === 0) return null;
            if (prev === null) return 0;
            return prev > 0 ? prev - 1 : prev;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files.length, selectedFile, isVideo, currentTab, duration, currentTime, isPlaying, playbackRate, togglePlayPause, lastKeyPressed, reverseInterval, setInPointAtCurrent, setOutPointAtCurrent]);

  useEffect(() => {
    return () => {
      if (reverseInterval) {
        clearInterval(reverseInterval);
      }
    };
  }, [reverseInterval]);

  useEffect(() => {
    if (selectedFile && isVideo) {
      setIsPlaying(false);
      setCurrentTime(0);
      setInPoint(null);
      setOutPoint(null);
      setPlaybackRate(1);
      setLastKeyPressed(null);

      if (reverseInterval) {
        clearInterval(reverseInterval);
        setReverseInterval(null);
      }

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = 1;
        // setDuration(videoRef.current.duration); // Already handled by handleLoadedMetadata
      }
    } else {
      setInPoint(null);
      setOutPoint(null);
      setPlaybackRate(1);
      setLastKeyPressed(null);

      if (reverseInterval) {
        clearInterval(reverseInterval);
        setReverseInterval(null);
      }
    }
  }, [selectedFileIndex, selectedFile, isVideo]);

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const removeFile = (index) => {
    const fileIdToRemove = files[index].id;
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileNamingPatterns(prev => {
      const newState = { ...prev };
      delete newState[fileIdToRemove];
      return newState;
    });

    if (selectedFileIndex === index) {
      setSelectedFileIndex(files.length > 1 ? 0 : null);
    } else if (selectedFileIndex > index) {
      setSelectedFileIndex(prev => prev - 1);
    }
    setSellSelectedFiles(prev => prev.filter(id => id !== fileIdToRemove));
    setExportSelectedFiles(prev => prev.filter(id => id !== fileIdToRemove));
  };

  const addNamingComponent = (component) => {
    const currentPattern = getCurrentNamingPattern();
    setCurrentNamingPattern([...currentPattern, {
      ...component,
      id: Math.random().toString(36).substr(2, 9),
      value: component.value || component.defaultValue || ''
    }]);
  };

  const removeNamingComponent = (id) => {
    const currentPattern = getCurrentNamingPattern();
    setCurrentNamingPattern(currentPattern.filter(c => c.id !== id));
  };

  const toggleNamingComponent = (component) => {
    const currentPattern = getCurrentNamingPattern();
    // Find existing by matching BOTH type and value exactly
    const existing = currentPattern.find(
      c => c.type === component.type && c.value === component.value
    );

    if (existing) {
      removeNamingComponent(existing.id);
    } else {
      addNamingComponent(component);
    }
  };

  const updateComponentValue = (id, value) => {
    const currentPattern = getCurrentNamingPattern();
    setCurrentNamingPattern(currentPattern.map(c => c.id === id ? { ...c, value } : c));
  };

  const generateNewName = (file) => {
    const pattern = fileNamingPatterns[file.id];
    
    // If no pattern exists for this file, return original name
    if (!pattern || pattern.length === 0) {
      return file.originalName;
    }

    const parts = [];

    pattern.forEach(component => {
      let value = '';

      switch (component.type) {
        case 'original':
          value = file.nameWithoutExt;
          break;
        case 'date':
          if (component.value && component.value !== '') {
            value = component.value;
          } else {
            const fileDate = new Date(file.originalFile.lastModified);
            const yymmdd = fileDate.getFullYear().toString().slice(-2) +
                          (fileDate.getMonth() + 1).toString().padStart(2, '0') +
                          fileDate.getDate().toString().padStart(2, '0');
            value = yymmdd;
          }
          break;
        case 'time':
          const fileTime = new Date(file.originalFile.lastModified);
          value = fileTime.toTimeString().split(' ')[0].replace(/:/g, '-');
          break;
        case 'counter':
          value = file.counter.toString().padStart(3, '0');
          break;
        case 'text':
          value = component.value || 'text';
          break;
        case 'separator':
          value = component.value || '_';
          break;
        case 'program':
        case 'gradyear':
        case 'shot':
        case 'rating':
          value = component.value || component.label;
          break;
        case 'player':
          value = (component.value || component.label).replace(/^[a-zA-Z]+-\d+-#/, '');
          break;
        default:
          value = component.value || component.label;
          break;
      }

      if (value) {
        parts.push(value);
      }
    });

    return `${parts.join('_')}.${file.extension}`;
  };

  const extractTagsFromFilename = (file) => {
    // generateNewName will now use the logic to pick either file-specific or global pattern
    const newName = generateNewName(file);
    const nameWithoutExt = newName.substring(0, newName.lastIndexOf('.')) || newName;
    const parts = nameWithoutExt.split('_').filter(part => part.trim().length > 0);

    const extractedTags = [];
    let detectedProgram = '';
    let detectedGradYear = '';
    let detectedPlayer = '';
    let detectedShot = '';
    let detectedDate = '';
    let detectedTeamName = '';

    parts.forEach(part => {
      const lowerPart = part.toLowerCase();

      // Extract program (home/away)
      if (lowerPart === 'home' || lowerPart === 'away') {
        detectedProgram = part.toUpperCase();
        extractedTags.push(part.toUpperCase());
      }
      // Extract graduation year
      else if (/^20\d{2}$/.test(part)) {
        detectedGradYear = part;
        extractedTags.push(`Class of ${part}`);
        extractedTags.push(part);
      }
      // Extract shot type
      else if (['goal', 'save', 'faceoff', 'broll', 'assist', 'penalty', 'groundball'].includes(lowerPart)) {
        detectedShot = part.toUpperCase();
        extractedTags.push(part.toUpperCase());
      }
      // Extract player number
      else if (/^\d+$/.test(part) && part.length <= 3) {
        detectedPlayer = `#${part}`;
        extractedTags.push(`#${part}`);
      }
      // Extract rating
      else if (/^\dstar$/.test(lowerPart)) {
        extractedTags.push(part);
      }
      // Extract date (YYMMDD format)
      else if (/^\d{6}$/.test(part)) {
        const year = '20' + part.substring(0, 2);
        const month = part.substring(2, 4);
        const day = part.substring(4, 6);
        detectedDate = `${year}-${month}-${day}`;
        extractedTags.push(detectedDate);
      }
      // Extract potential team name (longer text strings)
      else if (part.length > 3 && part !== '_' && !/^\d+$/.test(part)) {
        detectedTeamName = part;
        extractedTags.push(part);
      }
    });

    return {
      tags: [...new Set(extractedTags)],
      detectedShot,
      detectedPlayer,
      detectedProgram,
      detectedGradYear,
      detectedDate,
      detectedTeamName,
      nameWithoutExt
    };
  };

  const generateClipInfoWithAI = async (file) => {
    if (!file) return;

    setIsGeneratingClipInfo(true);
    try {
      const {
        tags: extractedTags,
        detectedShot: extractedDetectedShot,
        detectedPlayer,
        detectedProgram,
        detectedGradYear,
        detectedDate,
        detectedTeamName,
        nameWithoutExt
      } = extractTagsFromFilename(file);

      // Set clip type based on detectedShot
      if (extractedDetectedShot && extractedDetectedShot.toLowerCase() === 'goal') setClipType('goal');
      else if (extractedDetectedShot && extractedDetectedShot.toLowerCase() === 'save') setClipType('save');
      else if (extractedDetectedShot && extractedDetectedShot.toLowerCase() === 'faceoff') setClipType('faceoff');
      else if (extractedDetectedShot && extractedDetectedShot.toLowerCase() === 'assist') setClipType('assist');
      else setClipType('other');

      // Build title from detected components
      const titleParts = [];
      if (extractedDetectedShot) titleParts.push(extractedDetectedShot);
      if (detectedPlayer) titleParts.push(detectedPlayer);
      if (detectedProgram) titleParts.push(detectedProgram);
      if (detectedTeamName) titleParts.push(detectedTeamName);
      if (detectedGradYear) titleParts.push(detectedGradYear);
      if (detectedDate) titleParts.push(detectedDate);
      
      const generatedTitle = titleParts.join(' - ') || nameWithoutExt.replace(/_/g, ' ');

      setClipTitle(generatedTitle);
      
      // Enhanced description
      let description = `Lacrosse ${extractedDetectedShot || 'clip'}`;
      if (detectedPlayer) description += ` featuring player ${detectedPlayer}`;
      if (detectedTeamName) description += ` from ${detectedTeamName}`;
      if (detectedGradYear) description += ` (Class of ${detectedGradYear})`;
      if (detectedDate) description += ` - Game date: ${detectedDate}`;
      
      setClipDescription(description);
      setClipTags(extractedTags); // Remove duplicates
      
    } catch (error) {
      console.error('Error generating clip info:', error);
    } finally {
      setIsGeneratingClipInfo(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(getCurrentNamingPattern());
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentNamingPattern(items);
  };

  const handleSectionDragEnd = (result) => {
    if (!result.destination) return;

    const currentLayout = layoutConfigs[activeOrganizerTab];
    const sections = Array.from(currentLayout.sections);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);

    setLayoutConfigs(prev => ({
      ...prev,
      [activeOrganizerTab]: {
        ...prev[activeOrganizerTab],
        sections: sections
      }
    }));
  };

  const handleLutUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      // Parse .cube LUT file
      const lines = text.split('\n');
      const lutArray = [];
      
      let lut_3d_size = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('LUT_3D_SIZE')) {
          lut_3d_size = parseInt(trimmed.split(/\s+/)[1]);
          break;
        }
      }

      if (lut_3d_size === 0) {
        console.warn('LUT_3D_SIZE not found or invalid in .cube file. Attempting to infer size from data.');
      }

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('TITLE') && !trimmed.startsWith('LUT_3D_SIZE')) {
          const values = trimmed.split(/\s+/).map(v => parseFloat(v));
          if (values.length === 3 && values.every(v => !isNaN(v))) {
            lutArray.push(values);
          }
        }
      }

      // If lut_3d_size was found, validate against it
      if (lut_3d_size > 0 && lutArray.length !== lut_3d_size * lut_3d_size * lut_3d_size) {
        alert(`Mismatch between declared LUT_3D_SIZE (${lut_3d_size}) and actual data points (${lutArray.length}). Invalid LUT file.`);
        setLutFile(null);
        setLutData(null);
        return;
      }
      
      // If lut_3d_size was not found, try to infer it from the number of points
      if (lut_3d_size === 0 && lutArray.length > 0) {
        const inferredSize = Math.round(Math.cbrt(lutArray.length));
        if (inferredSize * inferredSize * inferredSize === lutArray.length) {
            lut_3d_size = inferredSize;
            console.log(`Inferred LUT_3D_SIZE: ${inferredSize}`);
        } else {
            console.warn("Could not infer LUT_3D_SIZE from data points (not a perfect cube).");
            alert('Invalid LUT file format: Could not determine LUT_3D_SIZE or infer it from data.');
            setLutFile(null);
            setLutData(null);
            return;
        }
      }


      if (lutArray.length > 0) {
        setLutFile(file.name);
        setLutData(lutArray);
      } else {
        alert('Invalid LUT file format or no data found.');
        setLutFile(null);
        setLutData(null);
      }
    } catch (error) {
      console.error('Error loading LUT:', error);
      alert('Failed to load LUT file');
      setLutFile(null);
      setLutData(null);
    }
  };

  const applyLutToCanvas = (canvas, ctx, lutArray, intensity) => {
    if (!lutArray || lutArray.length === 0) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Determine lutSize dynamically if not explicitly passed, or if LUT_3D_SIZE was not found
    let lutSize = Math.round(Math.cbrt(lutArray.length));
    if (lutSize * lutSize * lutSize !== lutArray.length) {
        console.warn("LUT data length is not a perfect cube. Using inferred size.");
    }

    for (let i = 0; i < data.length; i += 4) {
      const r_orig = data[i];
      const g_orig = data[i + 1];
      const b_orig = data[i + 2];

      const r_norm = r_orig / 255;
      const g_norm = g_orig / 255;
      const b_norm = b_orig / 255;

      // Find position in LUT
      // Bilinear interpolation for 3D LUTs is more accurate, but for simplicity,
      // we'll use nearest neighbor lookup here as per the prompt's implied complexity.
      const rIndex = Math.min(Math.max(0, Math.floor(r_norm * lutSize)), lutSize - 1);
      const gIndex = Math.min(Math.max(0, Math.floor(g_norm * lutSize)), lutSize - 1);
      const bIndex = Math.min(Math.max(0, Math.floor(b_norm * lutSize)), lutSize - 1);

      const lutIndex = rIndex + gIndex * lutSize + bIndex * lutSize * lutSize;

      if (lutIndex < lutArray.length) {
        const [newR_norm, newG_norm, newB_norm] = lutArray[lutIndex];
        
        // Convert back to 0-255 range for blending
        const newR_lut = newR_norm * 255;
        const newG_lut = newG_norm * 255;
        const newB_lut = newB_norm * 255;

        // Apply intensity (blend between original and LUT result)
        const factor = intensity / 100;
        data[i] = Math.round((newR_lut * factor) + (r_orig * (1 - factor)));
        data[i + 1] = Math.round((newG_lut * factor) + (g_orig * (1 - factor)));
        data[i + 2] = Math.round((newB_lut * factor) + (b_orig * (1 - factor)));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getVideoStyle = () => {
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    // Note: Applying .cube LUT directly via CSS filters is not possible.
    // For live video, this would typically involve drawing video frames to a canvas,
    // applying the LUT there, and then displaying that canvas.
    // The current setup only allows CSS filters for brightness, contrast, saturation.
    return { filter: baseFilter };
  };

  // This function now contains the core individual download logic
  const downloadRenamedFiles = async () => {
    const filesToExport = exportSelectedFiles.length > 0 
      ? files.filter(f => exportSelectedFiles.includes(f.id))
      : files;

    if (!filesToExport || filesToExport.length === 0) {
      alert('No files to export');
      return;
    }

    // Check if any pattern exists for the selected files
    const hasAnyPattern = filesToExport.some(file => {
      const pattern = fileNamingPatterns[file.id];
      return pattern && Array.isArray(pattern) && pattern.length > 0;
    });
    
    if (!hasAnyPattern) {
      alert('Please set up a naming pattern for your selected files in the LABELING tab.');
      return;
    }

    // Start individual downloads immediately - most reliable method
    setDownloadProgress({ current: 0, total: filesToExport.length, isDownloading: true });

    for (let i = 0; i < filesToExport.length; i++) {
      const file = filesToExport[i];
      try {
        const newName = generateNewName(file);
        
        // Create blob and download
        const blob = new Blob([file.originalFile], { type: file.originalFile.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        setDownloadProgress(prev => ({ ...prev, current: i + 1 }));

        // Wait between downloads to avoid browser blocking
        if (i < filesToExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (fileError) {
        console.error(`Failed to download ${file.originalName}:`, fileError);
      }
    }

    setDownloadProgress({ current: filesToExport.length, total: filesToExport.length, isDownloading: false });
    setExportSelectedFiles([]);
    
    setTimeout(() => {
      alert(`✅ Downloaded ${filesToExport.length} file(s)! Check your downloads folder.`);
    }, 500);
  };

  const startIndividualDownloads = async () => {
    await downloadRenamedFiles();
    setShowExportModal(false);
  };

  const tryFolderDownload = async () => {
    const filesToExport = exportSelectedFiles.length > 0 
      ? files.filter(f => exportSelectedFiles.includes(f.id))
      : files;

    if (!filesToExport || filesToExport.length === 0) {
      alert('No files selected for export');
      return;
    }

    // Check if any pattern exists for the selected files
    const hasAnyPattern = filesToExport.some(file => fileNamingPatterns[file.id] && fileNamingPatterns[file.id].length > 0);
    if (!hasAnyPattern) {
      alert('Please set up a naming pattern for your selected files in the LABELING tab.');
      return;
    }

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      alert('Folder selection is not available in preview mode. Please use individual downloads instead, or open the app in a new window.');
      return;
    }

    // Check if browser supports the API
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support folder selection. Please use individual downloads instead.');
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDownloadProgress({ current: 0, total: filesToExport.length, isDownloading: true });

      for (let i = 0; i < filesToExport.length; i++) {
        const file = filesToExport[i];
        try {
          // generateNewName now internally handles picking file-specific or global pattern
          const newName = generateNewName(file);
          const fileHandle = await directoryHandle.getFileHandle(newName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(file.originalFile);
          await writable.close();
          
          setDownloadProgress({ current: i + 1, total: filesToExport.length, isDownloading: true });
        } catch (fileError) {
          console.error(`Failed to save ${file.originalName}:`, fileError);
        }
      }

      setDownloadProgress({ current: filesToExport.length, total: filesToExport.length, isDownloading: false });
      setExportSelectedFiles([]);
      
      setTimeout(() => {
        setShowExportModal(false);
        alert(`✅ Saved ${filesToExport.length} file(s) to selected folder!`);
      }, 500);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled folder selection');
      } else {
        console.error('Folder download error:', error);
        alert('Folder selection is not available. Please use individual downloads instead.');
      }
      setDownloadProgress({ current: 0, total: 0, isDownloading: false });
    }
  };

  const clearAll = () => {
    setFiles([]);
    setFileNamingPatterns({}); // Clear file-specific patterns too
    setSelectedFileIndex(null);
    setIsPlaying(false);
    // REMOVED: setPresetApplied(false);
    setCurrentTab('home');
    setSellClipMode(false);
    setShowUploadSummary(false);
    setSellSelectedFiles([]);
    setExportSelectedFiles([]);
    setClipTitle('');
    setClipDescription('');
    setClipPrice(5);
    setClipType('goal');
    setClipTags([]);
    setEditMode(false);
    setSelectedProgramForPlayers(null);
    setSelectedGradYearForPlayers(null);
    setBatchName('');
    setUseBatchPricing(true);
    setBatchPrice(5);
    setIndividualPrices({});
    setLutFile(null);
    setLutData(null);
    setLutIntensity(100);
    setMarkers([]);
    setTrimSegments([]);
    setInPoint(null);
    setOutPoint(null);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) {
      return `${gb.toFixed(3)} GB`;
    } else {
      const mb = bytes / 1024 / 1024;
      return `${mb.toFixed(2)} MB`;
    }
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResizeStart = (panel, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeftWidth = leftPanelWidth;
    const startRightWidth = rightPanelWidth;
    const startFilesHeight = filesPanelHeight;

    const handleMouseMove = (moveEvent) => {
      if (panel === 'left') {
        const delta = moveEvent.clientX - startX;
        setLeftPanelWidth(Math.max(240, Math.min(600, startLeftWidth + delta)));
      } else if (panel === 'right') {
        const delta = startX - moveEvent.clientX;
        setRightPanelWidth(Math.max(240, Math.min(600, startRightWidth + delta)));
      } else if (panel === 'files') {
        const delta = moveEvent.clientY - startY;
        setFilesPanelHeight(Math.max(120, Math.min(400, startFilesHeight + delta)));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getZoomStyle = () => {
    if (zoomLevel === 'fit') {
      return { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' };
    } else {
      const scale = parseInt(zoomLevel) / 100;
      return { transform: `scale(${scale})`, transformOrigin: 'center center' };
    }
  };

  const addMarker = (type, label) => {
    if (!selectedFile || !isVideo) return;

    const newMarker = {
      id: Math.random().toString(36).substr(2, 9),
      fileId: selectedFile.id,
      time: currentTime,
      type,
      label: label || type.toUpperCase(),
      color: getMarkerColor(type)
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  const getMarkerColor = (type) => {
    const colors = {
      goal: '#22c55e',
      save: '#3b82f6',
      faceoff: '#f59e0b',
      penalty: '#ef4444',
      custom: '#8b5cf6'
    };
    return colors[type] || '#A88A86';
  };

  const removeMarker = (id) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  };

  const removeTrimSegment = (id) => {
    setTrimSegments(prev => prev.filter(s => s.id !== id));
  };

  const jumpToMarker = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setIsPlaying(false);
      videoRef.current.playbackRate = 1;
      setPlaybackRate(0);
      if (reverseInterval) {
        clearInterval(reverseInterval);
        setReverseInterval(null);
      }
    }
  };

  const exportToEDL = () => {
    if (!selectedFile || !isVideo) {
      alert('Please select a video file to export EDL.');
      return;
    }

    const fileMarkers = markers.filter(m => m.fileId === selectedFile.id);
    const fileSegments = trimSegments.filter(s => s.fileId === selectedFile.id);

    if (fileMarkers.length === 0 && fileSegments.length === 0) {
      alert('No markers or trim segments defined.');
      return;
    }

    let edl = `TITLE: ${selectedFile.nameWithoutExt}\nFCM: NON-DROP FRAME\n\n`;

    if (fileSegments.length > 0) {
      fileSegments.forEach((segment, index) => {
        const clipNum = String(index + 1).padStart(3, '0');
        edl += `EVENT ${clipNum}  ${selectedFile.nameWithoutExt} V     C\n`;
        edl += `* FROM CLIP NAME: ${segment.name}\n`;
        edl += `00:00:00:00 00:00:00:00 00:00:00:00 00:00:00:00\n`; // Placeholder for now, proper timecode calculation would be complex
        edl += `\n`;
      });
    }

    if (fileMarkers.length > 0) {
      fileMarkers.forEach((marker, index) => {
        const clipNum = String(fileSegments.length + index + 1).padStart(3, '0');
        edl += `EVENT ${clipNum}  ${selectedFile.nameWithoutExt} V     C\n`;
        edl += `* COMMENT: Marker: ${marker.label} at ${formatTime(marker.time)}\n`;
        edl += `00:00:00:00 00:00:00:00 00:00:00:00 00:00:00:00\n`; // Placeholder
        edl += `\n`;
      });
    }

    setEdlContent(edl);
    setShowEDLModal(true);
  };

  const downloadEDLFile = () => {
    try {
      const blob = new Blob([edlContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.nameWithoutExt}.edl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(`✅ EDL file downloaded!`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('❌ Error downloading EDL file.');
    }
  };

  const copyEDLToClipboard = () => {
    navigator.clipboard.writeText(edlContent).then(() => {
      alert('✅ EDL content copied!');
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('❌ Failed to copy.');
    });
  };

  const handleTimelineMouseDown = (e, type) => {
    e.preventDefault();
    if (!timelineRef.current || !videoRef.current || !duration) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineStart = timelineRect.left;
    const timelineWidth = timelineRect.width;

    const calculateTimeFromX = (clientX) => {
      let x = clientX - timelineStart;
      x = Math.max(0, Math.min(timelineWidth, x));
      const newTime = (x / timelineWidth) * duration;
      return Math.max(0, Math.min(duration, newTime));
    };

    const handleMouseMove = (moveEvent) => {
      const newTime = calculateTimeFromX(moveEvent.clientX);
      if (type === 'playhead') {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } else if (type === 'in') {
        setInPoint(newTime);
      } else if (type === 'out') {
        setOutPoint(newTime);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleSelectFileForSale = (fileId) => {
    setSellSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectFileForExport = (fileId) => {
    setExportSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectAllForSell = () => {
    if (sellSelectedFiles.length === files.length) {
      setSellSelectedFiles([]);
    } else {
      setSellSelectedFiles(files.map(f => f.id));
    }
  };

  const handleSelectAllForExport = () => {
    if (exportSelectedFiles.length === files.length) {
      setExportSelectedFiles([]);
    } else {
      setExportSelectedFiles(files.map(f => f.id));
    }
  };

  const handleStartSellingSelected = () => {
    console.log('🔘 Start Listing button clicked');
    console.log('📁 Selected files:', sellSelectedFiles);
    console.log('📝 Batch name:', batchName);
    
    if (sellSelectedFiles.length === 0) {
      alert('Please select at least one file to sell');
      return;
    }

    // Initialize batch name with current date if empty
    if (!batchName) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setBatchName(`Game Clips - ${dateStr}`);
      console.log('📝 Auto-generated batch name:', `Game Clips - ${dateStr}`);
    }

    // Initialize individual prices if using individual pricing
    if (!useBatchPricing) {
      const prices = {};
      sellSelectedFiles.forEach(fileId => {
        prices[fileId] = individualPrices[fileId] || 5;
      });
      setIndividualPrices(prices);
    }

    console.log('✅ Opening upload summary modal');
    console.log('📊 State before:', { sellClipMode, showUploadSummary });
    
    // Show summary screen instead of going directly to upload
    setSellClipMode(true);
    setShowUploadSummary(true);
    
    console.log('📊 State after:', { sellClipMode: true, showUploadSummary: true });
  };

  const handleConfirmUpload = async () => {
    setShowUploadSummary(false);
    setUploadingClip(true);
    setUploadProgress({ current: 0, total: sellSelectedFiles.length, currentFileName: '' });

    // Verify authentication first
    let currentUser;
    try {
      currentUser = await base44.auth.me();
      if (!currentUser) {
        alert('Please log in to upload clips');
        setUploadingClip(false);
        return;
      }
    } catch (error) {
      alert('Authentication error. Please log in again.');
      base44.auth.redirectToLogin(window.location.pathname);
      setUploadingClip(false);
      return;
    }

    // Batch upload all clips automatically
    for (let i = 0; i < sellSelectedFiles.length; i++) {
      const fileId = sellSelectedFiles[i];
      const currentFile = files.find(f => f.id === fileId);
      
      if (!currentFile || !currentFile.originalFile.type.startsWith('video/')) {
        console.log('⏭️ Skipping non-video file:', currentFile?.originalName);
        continue;
      }

      setUploadProgress({ 
        current: i + 1, 
        total: sellSelectedFiles.length,
        currentFileName: currentFile.originalName
      });

      try {
        console.log(`\n📤 [${i + 1}/${sellSelectedFiles.length}] Uploading:`, currentFile.originalName);
        console.log(`📦 File size: ${formatFileSize(currentFile.originalFile.size)}`);

        // Auto-generate clip info from filename using the helper function
        // generateNewName will now internally handle picking file-specific or global pattern
        const {
          tags: extractedTags,
          detectedShot: extractedDetectedShot,
          detectedPlayer,
          detectedProgram,
          detectedGradYear,
          detectedTeamName,
          nameWithoutExt
        } = extractTagsFromFilename(currentFile);

        // Adjust detectedShot to have a default if nothing is found (original logic used 'clip')
        const detectedShot = extractedDetectedShot || 'clip';

        const titleParts = [];
        if (detectedShot) titleParts.push(detectedShot);
        if (detectedPlayer) titleParts.push(detectedPlayer);
        if (detectedProgram) titleParts.push(detectedProgram);
        if (detectedTeamName) titleParts.push(detectedTeamName);
        if (detectedGradYear) titleParts.push(detectedGradYear);
        
        const autoTitle = titleParts.join(' - ') || nameWithoutExt.replace(/_/g, ' ');
        const autoDescription = `Lacrosse ${detectedShot}${detectedPlayer ? ` featuring player ${detectedPlayer}` : ''}${detectedTeamName ? ` from ${detectedTeamName}` : ''}${detectedGradYear ? ` (Class of ${detectedGradYear})` : ''}`;
        
        const autoClipType = ['goal', 'save', 'faceoff', 'assist'].includes(detectedShot.toLowerCase()) ? detectedShot.toLowerCase() : 'other';

        // === DIRECT TO GCS UPLOAD ===
        console.log('☁️ Step 1: Getting signed upload URL from GCS...');
        let urlResponse;
        try {
          urlResponse = await base44.functions.invoke('uploadToGCS', {
            action: 'get-upload-url',
            fileName: currentFile.originalFile.name,
            fileType: currentFile.originalFile.type,
            fileSize: currentFile.originalFile.size
          });
          console.log('Raw response from get-upload-url:', urlResponse);
        } catch (error) {
          console.error('❌ Step 1 failed - getting upload URL:', error);
          console.error('Error response data:', error.response?.data);
          throw new Error(`Failed to get upload URL: ${error.response?.data?.details || error.message}`);
        }

        if (!urlResponse.data || !urlResponse.data.upload_url) {
          console.error('❌ Invalid response from get-upload-url:', urlResponse);
          throw new Error('Failed to get signed upload URL from GCS - invalid response');
        }

        const { upload_url, file_name, public_url } = urlResponse.data;
        console.log('✅ Got signed URL for:', file_name);

        // Step 2: Upload directly to GCS using signed URL (bypasses Base44 entirely!)
        console.log('☁️ Step 2: Uploading directly to Google Cloud Storage...');
        console.log(`⬆️ File size: ${formatFileSize(currentFile.originalFile.size)}`);
        console.log(`📍 Upload URL: ${upload_url.substring(0, 100)}...`);
        
        const uploadStartTime = Date.now();
        let uploadResponse;
        try {
          uploadResponse = await fetch(upload_url, {
            method: 'PUT',
            headers: {
              'Content-Type': currentFile.originalFile.type || 'video/mp4'
              // Removed x-goog-acl header since bucket uses uniform access
            },
            body: currentFile.originalFile,
            mode: 'cors'
          });
          
          const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
          console.log(`⏱️ Upload took ${uploadDuration} seconds`);
          console.log(`📊 Response status: ${uploadResponse.status} ${uploadResponse.statusText}`);
        } catch (error) {
          console.error('❌ Step 2 failed - direct upload to GCS:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          
          if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error(
              `CORS Error: Your Google Cloud Storage bucket needs CORS configuration. ` +
              `Run this in Google Cloud Shell: gsutil cors set cors.json gs://flippastorage ` +
              `(See console for full instructions)`
            );
          }
          
          throw new Error(`Failed to upload to GCS: ${error.message}`);
        }

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ GCS upload failed:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            error: errorText
          });
          throw new Error(`GCS upload failed: ${uploadResponse.statusText} - ${errorText}`);
        }

        console.log('✅ File uploaded to GCS successfully!');
        console.log('✅ File is publicly accessible via bucket-level access');

        // Use the public URL immediately (no need to wait or call finalize)
        const videoUrl = public_url;
        console.log('✅ Video URL:', videoUrl);

        // Generate thumbnail
        console.log('🖼️ Step 4: Generating thumbnail...');
        const video = document.createElement('video');
        video.src = currentFile.url;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.remove();
            reject(new Error('Thumbnail generation timeout'));
          }, 10000);
          
          video.addEventListener('loadedmetadata', () => {
            video.currentTime = Math.min(1, video.duration / 2);
          }, { once: true });
          
          video.addEventListener('seeked', () => {
            clearTimeout(timeout);
            resolve(true);
          }, { once: true });
          
          video.addEventListener('error', () => {
            clearTimeout(timeout);
            video.remove();
            reject(new Error('Video loading error'));
          }, { once: true });
        });

        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const thumbnailBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
        
        console.log('☁️ Step 5: Uploading thumbnail...');
        const thumbnailResult = await base44.integrations.Core.UploadFile({ file: thumbnailFile });
        console.log('✅ Thumbnail uploaded');

        // Create clip
        console.log('💾 Step 6: Creating clip record in database...');
        const priceToUse = useBatchPricing ? batchPrice : (individualPrices[fileId] || 5);
        const clipData = {
          creator_email: currentUser.email,
          title: autoTitle,
          description: autoDescription,
          price: priceToUse,
          thumbnail_url: thumbnailResult.file_url,
          video_url: videoUrl,
          preview_url: videoUrl,
          duration: video.duration,
          clip_type: autoClipType,
          tags: extractedTags,
          status: 'active',
          team_name: batchName
        };

        await base44.entities.Clip.create(clipData);
        console.log(`✅ [${i + 1}/${sellSelectedFiles.length}] Clip uploaded successfully!`);

      } catch (error) {
        console.error(`❌ Failed to upload ${currentFile.originalName}:`, error);
        console.error('Error stack:', error.stack);
        alert(`⚠️ Failed to upload "${currentFile.originalName}": ${error.message || 'Unknown error'}. Continuing with remaining files...`);
      }
    }

    // All done
    console.log('\n🎉 All uploads complete!');
    queryClient.invalidateQueries({ queryKey: ['marketplace-clips'] });
    setUploadComplete(true);
    setUploadingClip(false);
  };

  const handleNextClipInBatch = async () => {
    queryClient.invalidateQueries({ queryKey: ['marketplace-clips'] });
    setUploadComplete(true);
    setUploadingClip(false);
  };

  const handleCloseUploadModal = () => {
    setSellClipMode(false);
    setShowUploadSummary(false);
    setSellSelectedFiles([]);
    setCurrentSellFileIndex(0);
    setBatchName('');
    setUseBatchPricing(true);
    setBatchPrice(5);
    setIndividualPrices({});
    setUploadComplete(false);
    setUploadingClip(false);
    setUploadProgress({ current: 0, total: 0, currentFileName: '' });
  };

  const createClipListing = async () => {
    // This function is no longer used, as batch upload logic is in handleConfirmUpload
    return;
  };

  const handleCreateNewLayout = () => {
    const nextLayoutNumber = Object.keys(layoutConfigs).length + 1;
    const newLayoutKey = `layout${nextLayoutNumber}`;
    
    const sections = newLayoutForm.sections.map((section, sectionIdx) => {
      const sectionId = `section_${Date.now()}_${sectionIdx}`; // Unique ID for section
      return {
        id: sectionId,
        title: section.title,
        buttons: section.buttons.map((btn, btnIdx) => {
          const buttonId = `custom_${Date.now()}_${sectionIdx}_${btnIdx}`; // Unique ID for button
          return {
            id: buttonId,
            label: btn.label,
            value: btn.label, // Use btn.label as value for new custom buttons
            type: sectionId // Type is the section's ID
          };
        })
      };
    });

    setLayoutConfigs(prev => ({
      ...prev,
      [newLayoutKey]: {
        name: newLayoutForm.name || `Layout ${nextLayoutNumber}`,
        programGradYearPlayerNumbers: {}, // Initialize this
        sections: sections
      }
    }));

    // Switch to new layout and close creator
    setActiveOrganizerTab(newLayoutKey);
    setShowLayoutCreator(false);
    setNewLayoutForm({
      name: '',
      sections: [{ title: 'SECTION 1', buttons: [{ label: 'Button 1' }] }]
    });
  };

  const addSectionToForm = () => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: `SECTION ${prev.sections.length + 1}`, buttons: [{ label: 'Button 1' }] }
      ]
    }));
  };

  const removeSectionFromForm = (sectionIdx) => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== sectionIdx)
    }));
  };

  const updateSectionTitleInForm = (sectionIdx, newTitle) => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIdx ? { ...section, title: newTitle } : section
      )
    }));
  };

  const addButtonToSectionInForm = (sectionIdx) => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIdx
          ? { ...section, buttons: [...section.buttons, { label: `Button ${section.buttons.length + 1}` }] }
          : section
      )
    }));
  };

  const removeButtonFromSectionInForm = (sectionIdx, buttonIdx) => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIdx
          ? { ...section, buttons: section.buttons.filter((_, bIdx) => bIdx !== buttonIdx) }
          : section
      )
    }));
  };

  const updateButtonLabelInForm = (sectionIdx, buttonIdx, newLabel) => {
    setNewLayoutForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIdx
          ? {
              ...section,
              buttons: section.buttons.map((btn, bIdx) =>
                bIdx === buttonIdx ? { ...btn, label: newLabel } : btn
              )
            }
          : section
      )
    }));
  };

  const renderOrganizerContent = () => {
    const currentLayout = layoutConfigs[activeOrganizerTab];
    if (!currentLayout) return null;

    return (
      <>
        <DragDropContext onDragEnd={handleSectionDragEnd}>
          <Droppable droppableId="sections" isDropDisabled={!editMode}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5">
                {currentLayout.sections.map((section, sectionIndex) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={sectionIndex}
                    isDragDisabled={!editMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative transition-all duration-200"
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.9 : 1,
                          transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                            : provided.draggableProps.style?.transform
                        }}
                      >
                        {editMode && !['program', 'gradyear', 'shot', 'players', 'rating'].includes(section.id) && (
                          <button
                            onClick={() => removeCustomSection(activeOrganizerTab, section.id)}
                            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 z-10"
                          >
                            ×
                          </button>
                        )}

                        <div className="px-2 py-1 glass-button text-white font-bold text-xs rounded-md text-center relative flex items-center justify-center gap-1">
                          {editMode && (
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing hover:text-[#A88A86] transition-colors">
                              <GripVertical className="w-2.5 h-2.5 text-gray-300" />
                            </div>
                          )}
                          {editMode ? (
                            <input
                              value={section.title}
                              onChange={(e) => updateSectionTitle(activeOrganizerTab, section.id, e.target.value)}
                              className="bg-transparent text-center flex-1 outline-none font-bold text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            section.title
                          )}
                        </div>

                        <div className={section.id === 'players' ? 'mt-1' : 'mt-1'}>
                          {section.id === 'players' ? (
                            <div className="space-y-0.5">
                              {!selectedProgramForPlayers || !selectedGradYearForPlayers ? (
                                <div className="text-center text-gray-400 text-xs py-1.5">
                                  Select program & year
                                </div>
                              ) : (
                                <>
                                  <div className="text-center text-[#A88A86] text-xs font-semibold mb-0.5">
                                    {selectedProgramForPlayers.toUpperCase()} - {selectedGradYearForPlayers}
                                  </div>
                                  <div className="grid grid-cols-4 gap-0.5 max-h-24 overflow-y-auto">
                                    {getPlayerNumbersForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers).map((number, index) => (
                                      <div key={index} className="relative">
                                        {number ? (
                                          <button
                                            onClick={() => !editMode && addPlayerNumberForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers, number)}
                                            className={`w-full px-0.5 py-0.5 text-white text-xs font-semibold rounded transition-all ${
                                              getCurrentNamingPattern().some(c => c.type === 'player' && c.value === `${selectedProgramForPlayers}-${selectedGradYearForPlayers}-#${number}`)
                                                ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                                : 'glass-button'
                                            } ${editMode ? 'cursor-default' : ''}`}
                                          >
                                            #{number}
                                          </button>
                                        ) : (
                                          <input
                                            type="text"
                                            placeholder={`#${index + 1}`}
                                            value={number}
                                            onChange={(e) => {
                                              const currentNumbers = getPlayerNumbersForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers);
                                              const newNumbers = [...currentNumbers];
                                              newNumbers[index] = e.target.value;
                                              setPlayerNumbersForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers, newNumbers);
                                            }}
                                            onBlur={(e) => {
                                              if (e.target.value.trim()) {
                                                addPlayerNumberForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers, e.target.value.trim());
                                                e.currentTarget.blur();
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && e.target.value.trim()) {
                                                addPlayerNumberForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers, e.target.value.trim());
                                                e.currentTarget.blur();
                                              }
                                            }}
                                            className="w-full px-0.5 py-0.5 text-white text-xs font-semibold rounded bg-white/10 border border-white/20 text-center placeholder:text-gray-500"
                                          />
                                        )}
                                        {number && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removePlayerNumberForProgramAndGradYear(selectedProgramForPlayers, selectedGradYearForPlayers, index);
                                            }}
                                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : section.id === 'program' ? (
                            <div className="grid grid-cols-2 gap-0.5">
                              {section.buttons.map((button) => (
                                <div key={button.id} className="relative">
                                  <button
                                    onClick={() => !editMode && handleProgramButtonClick(button)}
                                    className={`w-full px-1 py-0.5 text-white text-xs font-semibold rounded transition-all ${
                                      getCurrentNamingPattern().some(c => c.type === 'program' && c.value === button.label)
                                        ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                        : 'glass-button'
                                    } ${editMode ? 'cursor-default' : ''}`}
                                  >
                                    {editMode ? (
                                      <input
                                        value={button.label}
                                        onChange={(e) => updateButtonLabel(activeOrganizerTab, section.id, button.id, e.target.value)}
                                        className="bg-transparent text-center w-full outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      button.label
                                    )}
                                  </button>
                                  {editMode && button.id.startsWith('custom_') && (
                                    <button
                                      onClick={() => removeCustomButton(activeOrganizerTab, section.id, button.id)}
                                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : section.id === 'gradyear' ? (
                            <div className="grid grid-cols-4 gap-0.5">
                              {section.buttons.map((button) => (
                                <div key={button.id} className="relative">
                                  <button
                                    onClick={() => !editMode && handleGradYearButtonClick(button)}
                                    className={`w-full px-0.5 py-0.5 text-white text-xs font-semibold rounded transition-all ${
                                      getCurrentNamingPattern().some(c => c.type === 'gradyear' && c.value === button.label)
                                        ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                        : 'glass-button'
                                    } ${editMode ? 'cursor-default' : ''}`}
                                  >
                                    {editMode ? (
                                      <input
                                        value={button.label}
                                        onChange={(e) => updateButtonLabel(activeOrganizerTab, section.id, button.id, e.target.value)}
                                        className="bg-transparent text-center w-full outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      button.label
                                    )}
                                  </button>
                                  {editMode && button.id.startsWith('custom_') && (
                                    <button
                                      onClick={() => removeCustomButton(activeOrganizerTab, section.id, button.id)}
                                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : section.id === 'shot' ? (
                            <div className="grid grid-cols-2 gap-0.5">
                              {section.buttons.map((button) => (
                                <div key={button.id} className="relative">
                                  <button
                                    onClick={() => !editMode && handleShotButtonClick(button)}
                                    className={`w-full px-1 py-0.5 text-white text-xs font-semibold rounded transition-all ${
                                      getCurrentNamingPattern().some(c => c.type === 'shot' && c.value === button.label)
                                        ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                        : 'glass-button'
                                    } ${editMode ? 'cursor-default' : ''}`}
                                  >
                                    {editMode ? (
                                      <input
                                        value={button.label}
                                        onChange={(e) => updateButtonLabel(activeOrganizerTab, section.id, button.id, e.target.value)}
                                        className="bg-transparent text-center w-full outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      button.label
                                    )}
                                  </button>
                                  {editMode && button.id.startsWith('custom_') && (
                                    <button
                                      onClick={() => removeCustomButton(activeOrganizerTab, section.id, button.id)}
                                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : section.id === 'rating' ? (
                            <div className="grid grid-cols-3 gap-0.5">
                              {section.buttons.map((button) => (
                                <div key={button.id} className="relative">
                                  <button
                                    onClick={() => !editMode && handleRatingButtonClick(button)}
                                    className={`w-full px-0.5 py-0.5 text-white text-xs font-semibold rounded transition-all flex items-center justify-center gap-0.5 ${
                                      getCurrentNamingPattern().some(c => c.type === button.type && c.value === button.label)
                                        ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                        : 'glass-button'
                                    } ${editMode ? 'cursor-default' : ''}`}
                                  >
                                    {editMode ? (
                                      <input
                                        value={button.label}
                                        onChange={(e) => updateButtonLabel(activeOrganizerTab, section.id, button.id, e.target.value)}
                                        className="bg-transparent text-center w-full outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <>
                                        <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                                        {button.label.replace('★', '')}
                                      </>
                                    )}
                                  </button>
                                  {editMode && button.id.startsWith('custom_') && (
                                    <button
                                      onClick={() => removeCustomButton(activeOrganizerTab, section.id, button.id)}
                                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5">
                              {section.buttons.map((button) => (
                                <div key={button.id} className="relative">
                                  <button
                                    onClick={() => !editMode && handleGenericButtonClick(button)}
                                    className={`w-full px-1 py-0.5 text-white text-xs font-semibold rounded transition-all ${
                                      getCurrentNamingPattern().some(c => c.type === button.type && c.value === button.label)
                                        ? 'glass-button-active ring-1 ring-[#EAE6E3]'
                                        : 'glass-button'
                                    } ${editMode ? 'cursor-default' : ''}`}
                                  >
                                    {editMode ? (
                                      <input
                                        value={button.label}
                                        onChange={(e) => updateButtonLabel(activeOrganizerTab, section.id, button.id, e.target.value)}
                                        className="bg-transparent text-center w-full outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      button.label
                                    )}
                                  </button>
                                  {editMode && button.id.startsWith('custom_') && (
                                    <button
                                      onClick={() => removeCustomButton(activeOrganizerTab, section.id, button.id)}
                                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {editMode && section.id !== 'players' && (
                            <button
                              onClick={() => addCustomButton(activeOrganizerTab, section.id)}
                              className="w-full px-1 py-0.5 text-white text-xs font-semibold rounded glass-button border border-dashed border-white/30 hover:border-white/50 transition-all mt-0.5"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {editMode && (
          <button
            onClick={() => addCustomSection(activeOrganizerTab)}
            className="w-full px-2 py-1.5 text-white text-xs font-semibold rounded-lg glass-button border border-dashed border-white/30 mt-1.5 hover:border-white/50 transition-all"
          >
            + Add Section
          </button>
        )}

        {!editMode && (
          <button
            onClick={() => setShowLayoutCreator(true)}
            className="w-full px-2 py-1.5 text-white text-xs font-semibold rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mt-1.5 transition-all"
          >
            <Plus className="w-2.5 h-2.5 mr-0.5" />
            New Layout
          </button>
        )}
      </>
    );
  };

  const currentNamingPattern = getCurrentNamingPattern();

  if (currentTab === 'home' || files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden" style={{ fontFamily: 'Urbanist, sans-serif', color: '#EAE6E3' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');

          .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          }

          .glass-dark {
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .glass-button {
            background: rgba(168, 138, 134, 0.3);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 15px rgba(168, 138, 134, 0.2);
            transition: all 0.2s ease;
          }

          .glass-button:hover {
            background: rgba(168, 138, 134, 0.5);
            box-shadow: 0 4px 15px rgba(168, 138, 134, 0.3);
          }

          .glass-button-active {
            background: rgba(168, 138, 134, 0.6);
            box-shadow: 0 4px 15px rgba(168, 138, 134, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.1);
          }

          .bg-animated {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 20% 50%, rgba(168, 138, 134, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(138, 106, 102, 0.15) 0%, transparent 50%);
            animation: pulse 8s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }

          .resize-handle {
            background: rgba(168, 138, 134, 0.2);
            transition: background 0.2s;
          }

          .resize-handle:hover {
            background: rgba(168, 138, 134, 0.6);
          }
        `}</style>

        <div className="bg-animated"></div>

        {files.length > 0 && (
          <div className="glass-dark px-4 py-2 flex gap-2 relative z-10 border-b border-white/10">
            <button onClick={() => setCurrentTab('home')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'home' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
              <Home className="w-3 h-3 inline mr-1" />HOME
            </button>
            <button onClick={() => setCurrentTab('edit')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'edit' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
              <Sliders className="w-3 h-3 inline mr-1" />EDIT
            </button>
            <button onClick={() => setCurrentTab('labeling')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'labeling' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
              <FileText className="w-3 h-3 inline mr-1" />LABELING
            </button>
            <button onClick={() => { setCurrentTab('export'); setShowExportModal(true); }} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'export' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
              <Download className="w-3 h-3 inline mr-1" />EXPORT
            </button>
            <button onClick={() => setCurrentTab('sell')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'sell' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
              <Tag className="w-3 h-3 inline mr-1" />SELL
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 drop-shadow-2xl">flippa</h1>
              <p className="text-[#A88A86] text-lg drop-shadow-lg">Click boxes to build your perfect filename</p>
            </div>
            <FileUploadZone onFilesAdded={handleFilesAddedWithLimit} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden" style={{ fontFamily: 'Urbanist, sans-serif', color: '#EAE6E3' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"');

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .glass-dark {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-button {
          background: rgba(168, 138, 134, 0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px (168, 138, 134, 0.2);
          transition: all 0.2s ease;
        }

        .glass-button:hover {
          background: rgba(168, 138, 134, 0.5);
          box-shadow: 0 4px 15px rgba(168, 138, 134, 0.3);
        }

        .glass-button-active {
          background: rgba(168, 138, 134, 0.6);
          box-shadow: 0 4px 15px rgba(168, 138, 134, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.1);
        }

        .resize-handle {
          background: rgba(168, 138, 134, 0.2);
          transition: background 0.2s;
        }

        .resize-handle:hover {
          background: rgba(168, 138, 134, 0.6);
        }
      `}</style>

      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
        className="hidden"
      />

      <div className="glass-dark px-4 py-2 flex gap-2 relative z-10 border-b border-white/10">
        <button onClick={() => setCurrentTab('home')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'home' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
          <Home className="w-3 h-3 inline mr-1" />HOME
        </button>
        <button onClick={() => setCurrentTab('edit')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'edit' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
          <Sliders className="w-3 h-3 inline mr-1" />EDIT
        </button>
        <button onClick={() => setCurrentTab('labeling')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'labeling' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
          <FileText className="w-3 h-3 inline mr-1" />LABELING
        </button>
        <button onClick={() => { setCurrentTab('export'); setShowExportModal(true); }} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'export' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
          <Download className="w-3 h-3 inline mr-1" />EXPORT
        </button>
        <button onClick={() => setCurrentTab('sell')} className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentTab === 'sell' ? 'glass-button-active text-white' : 'glass-button text-[#EAE6E3]'}`}>
          <Tag className="w-3 h-3 inline mr-1" />SELL
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden relative" style={{ height: `calc(100% - ${filesPanelHeight}px)` }}>
          <div className="glass-dark border-r border-white/10 flex flex-col overflow-hidden" style={{ width: `${leftPanelWidth}px` }}>
            <div className="flex-1 p-2 overflow-y-auto text-xs">
              {currentTab === 'edit' && (
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-xs mb-2">COLOR GRADING</h3>

                  <div>
                    <label className="text-white text-xs font-semibold mb-1 block">Brightness: {brightness}%</label>
                    <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
                  </div>

                  <div>
                    <label className="text-white text-xs font-semibold mb-1 block">Contrast: {contrast}%</label>
                    <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full" />
                  </div>

                  <div>
                    <label className="text-white text-xs font-semibold mb-1 block">Saturation: {saturation}%</label>
                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full" />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-white text-xs font-semibold mb-2">LUT (Color Grading)</h4>
                    
                    <input
                      ref={lutInputRef}
                      type="file"
                      accept=".cube"
                      onChange={handleLutUpload}
                      className="hidden"
                    />

                    <Button
                      onClick={() => lutInputRef.current?.click()}
                      size="sm"
                      variant="outline"
                      className="w-full mb-1 text-xs py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-md border-2 border-transparent hover:border-blue-300 focus:outline-none transition-all duration-200"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {lutFile ? 'Change LUT' : 'Upload LUT (.cube)'}
                    </Button>

                    {lutFile && (
                      <div className="space-y-2">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2">
                          <div className="text-green-300 text-xs font-semibold truncate">
                            ✓ {lutFile}
                          </div>
                        </div>

                        <div>
                          <label className="text-white text-xs font-semibold mb-1 block">
                            LUT Intensity: {lutIntensity}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={lutIntensity}
                            onChange={(e) => setLutIntensity(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <Button
                          onClick={() => {
                            setLutFile(null);
                            setLutData(null);
                            setLutIntensity(100);
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs py-1.5 border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Remove LUT
                        </Button>
                      </div>
                    )}

                    <div className="mt-2 bg-amber-500/20 border border-amber-500/30 rounded-lg p-2">
                      <p className="text-amber-300 text-xs">
                        ⚠️ LUT preview only works for images. For videos, LUT will be applied on export.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-white text-xs font-semibold mb-1">Zoom</h4>
                    <Select value={zoomLevel} onValueChange={setZoomLevel}>
                      <SelectTrigger className="w-full text-xs h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="150">150%</SelectItem>
                        <SelectItem value="200">200%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* TRIM CONTROLS */}
                  <div className="pt-2 border-t border-white/10">
                    <h3 className="text-white font-bold text-xs mb-2">TRIM & MARKERS</h3>

                    <div>
                      <h4 className="text-white text-xs font-semibold mb-1">Trim Points</h4>
                      <Button onClick={setInPointAtCurrent} disabled={!isVideo} className="w-full mb-1 text-xs py-1.5">Set IN Point (I)</Button>
                      <Button onClick={setOutPointAtCurrent} disabled={!isVideo} className="w-full mb-1 text-xs py-1.5">Set OUT Point (O)</Button>
                      <Button 
                        onClick={addTrimSegment} 
                        disabled={!isVideo || inPoint === null || outPoint === null || inPoint >= outPoint} 
                        className="w-full bg-green-600 hover:bg-green-700 text-xs py-1.5"
                      >
                        Add Segment
                      </Button>

                      {inPoint !== null && <div className="text-white text-xs mt-1">IN: {formatTime(inPoint)}</div>}
                      {outPoint !== null && <div className="text-white text-xs">OUT: {formatTime(outPoint)}</div>}
                      {inPoint !== null && outPoint !== null && (
                        <div className="text-[#A88A86] text-xs font-semibold mt-0.5">
                          Duration: {formatTime(outPoint - inPoint)}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10 mt-2">
                      <h4 className="text-white text-xs font-semibold mb-1">Add Marker</h4>
                      <div className="space-y-0.5">
                        <Button onClick={() => addMarker('goal', 'GOAL')} disabled={!isVideo} size="sm" className="w-full text-xs py-1.5" style={{ backgroundColor: '#22c55e' }}>Goal</Button>
                        <Button onClick={() => addMarker('save', 'SAVE')} disabled={!isVideo} size="sm" className="w-full text-xs py-1.5" style={{ backgroundColor: '#3b82f6' }}>Save</Button>
                        <Button onClick={() => addMarker('faceoff', 'FACEOFF')} disabled={!isVideo} size="sm" className="w-full text-xs py-1.5" style={{ backgroundColor: '#f59e0b' }}>Faceoff</Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 mt-2">
                      <h4 className="text-white text-xs font-semibold mb-1">Markers</h4>
                      <div className="space-y-0.5 max-h-32 overflow-y-auto">
                        {selectedFile && markers.filter(m => m.fileId === selectedFile.id).map(marker => (
                          <div key={marker.id} className="flex items-center justify-between bg-white/10 rounded px-1 py-0.5">
                            <button onClick={() => jumpToMarker(marker.time)} className="flex-1 text-left text-xs text-white hover:text-[#A88A86]">
                              <span style={{ color: marker.color }}>●</span> {marker.label} ({formatTime(marker.time)})
                            </button>
                            <button onClick={() => removeMarker(marker.id)} className="text-red-400 hover:text-red-300 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <h4 className="text-white text-xs font-semibold mb-1">Segments ({selectedFile && trimSegments.filter(s => s.fileId === selectedFile.id).length})</h4>
                      <div className="space-y-0.5 max-h-32 overflow-y-auto">
                        {selectedFile && trimSegments.filter(s => s.fileId === selectedFile.id).length === 0 && (
                          <div className="text-gray-500 text-xs py-1 text-center">No segments yet</div>
                        )}
                        {selectedFile && trimSegments.filter(s => s.fileId === selectedFile.id).map(segment => (
                          <div key={segment.id} className="flex items-center justify-between bg-white/10 rounded px-1 py-0.5">
                            <div className="flex-1 text-xs text-white">
                              <div className="font-semibold">{segment.name}</div>
                              <div className="text-gray-400">{formatTime(segment.start)} - {formatTime(segment.end)}</div>
                              <div className="text-[#A88A86]">Duration: {formatTime(segment.duration)}</div>
                            </div>
                            <button onClick={() => removeTrimSegment(segment.id)} className="text-red-400 hover:text-red-300 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={exportToEDL} disabled={!isVideo || (markers.filter(m => m.fileId === selectedFile?.id).length === 0 && trimSegments.filter(s => s.fileId === selectedFile?.id).length === 0)} className="w-full text-xs mt-2 py-1.5">
                      Export to EDL
                    </Button>
                  </div>
                </div>
              )}

              {currentTab === 'labeling' && (
                <div className="space-y-2 mb-2">
                  <h3 className="text-white font-bold text-xs mb-2">BUILD FILENAME</h3>
                  
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <FileText className="w-4 h-4 text-blue-300" />
                      <div className="text-blue-300 text-xs font-semibold">Click buttons to build name</div>
                    </div>
                    <div className="text-gray-300 text-xs">
                      The generated name applies to the selected video.
                    </div>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="namingPattern">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 min-h-[40px]">
                          {getCurrentNamingPattern().map((component, index) => (
                            <Draggable key={component.id} draggableId={component.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-1 glass rounded p-1">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                  </div>
                                  <input
                                    value={component.value}
                                    onChange={(e) => updateComponentValue(component.id, e.target.value)}
                                    className="flex-1 bg-white/20 text-white px-1.5 py-0.5 rounded text-xs"
                                    placeholder={component.label}
                                  />
                                  <button onClick={() => removeNamingComponent(component.id)}>
                                    <X className="w-3 h-3 text-gray-400" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {selectedFile && (
                    <div className="glass rounded-lg p-2 mt-2 border border-[#A88A86]/50">
                      <div className="text-xs text-gray-400 mb-1">Preview:</div>
                      <div className="bg-black/40 rounded p-1.5 mb-1">
                        <div className="text-xs text-gray-500">Original:</div>
                        <div className="text-white text-xs break-all">{selectedFile.originalName}</div>
                      </div>
                      <div className="bg-black/40 rounded p-1.5">
                        <div className="text-xs text-gray-500">New Name:</div>
                        <div className="text-[#A88A86] font-bold text-xs break-all">{generateNewName(selectedFile)}</div>
                      </div>
                    </div>
                  )}

                  {getCurrentNamingPattern().length === 0 && (
                    <div className="text-center text-gray-500 text-xs py-3">
                      Click buttons in ORGANIZER →
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'sell' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-xs">SELL CLIPS</h3>
                    <Button
                      onClick={handleSelectAllForSell}
                      size="sm"
                      variant="outline"
                      className="text-xs py-1.5 h-6 px-2 border-white/20 text-white hover:text-white"
                    >
                      {sellSelectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Tag className="w-4 h-4 text-green-400" />
                      <h4 className="text-green-400 font-bold text-xs">Smart Tagging</h4>
                    </div>
                    <p className="text-gray-300 text-xs">
                      Tags extracted from filenames: teams, players, grad years, and more!
                    </p>
                  </div>

                  {sellSelectedFiles.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Select files from the carousel below</p>
                      <p className="text-xs mt-1">or click "Select All" above</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded-lg p-2">
                        <div className="text-white font-semibold mb-0.5 text-xs">Selected Files</div>
                        <div className="text-[#A88A86] text-xl font-bold">{sellSelectedFiles.length}</div>
                      </div>

                      <div>
                        <label className="text-white text-xs font-semibold mb-1 block">Batch Name *</label>
                        <Input
                          value={batchName}
                          onChange={(e) => setBatchName(e.target.value)}
                          placeholder="e.g., Warriors vs Eagles - March 15"
                          className="bg-white/10 border-white/20 text-white text-xs h-7"
                        />
                        <p className="text-xs text-gray-400 mt-0.5">Used for searching and organizing clips</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-white text-xs font-semibold">Pricing Method</label>
                        </div>
                        
                        <div className="space-y-1">
                          <button
                            onClick={() => setUseBatchPricing(true)}
                            className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                              useBatchPricing 
                                ? 'border-green-500 bg-green-500/20' 
                                : 'border-white/20 bg-white/5'
                            }`}
                          >
                            <div className="font-semibold text-white text-sm">Same Price for All</div>
                            <div className="text-xs text-gray-300 mt-0.5">Set one price for entire batch</div>
                          </button>

                          <button
                            onClick={() => setUseBatchPricing(false)}
                            className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                              !useBatchPricing 
                                ? 'border-green-500 bg-green-500/20' 
                                : 'border-white/20 bg-white/5'
                            }`}
                          >
                            <div className="font-semibold text-white text-sm">Individual Pricing</div>
                            <div className="text-xs text-gray-300 mt-0.5">Set different price for each clip</div>
                          </button>
                        </div>

                        {useBatchPricing && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <label className="text-white text-xs font-semibold mb-1 block">Batch Price ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={batchPrice}
                              onChange={(e) => setBatchPrice(parseFloat(e.target.value))}
                              className="bg-white/10 border-white/20 text-white text-xs h-7"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleStartSellingSelected}
                        disabled={!batchName || batchName.trim() === ''}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 font-bold py-2 text-sm"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        List {sellSelectedFiles.length} Clip{sellSelectedFiles.length > 1 ? 's' : ''}
                      </Button>

                      <Button
                        onClick={() => {
                          setSellSelectedFiles([]);
                          setBatchName('');
                          setUseBatchPricing(true);
                          setBatchPrice(5);
                          setIndividualPrices({});
                        }}
                        variant="outline"
                        className="w-full border-white/20 py-1.5 text-xs"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-2 flex-shrink-0">
              <Button onClick={handleFolderClick} className="w-full text-xs py-1.5">
                <Upload className="w-3 h-3 mr-1" />Add Files
              </Button>
            </div>
          </div>

          <div
            className="resize-handle w-1 cursor-col-resize hover:w-2"
            onMouseDown={(e) => handleResizeStart('left', e)}
          />

          <div className="flex-1 glass-dark flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-2 overflow-hidden" ref={viewerRef} style={getZoomStyle()}>
              {selectedFile ? (
                <div className="w-full h-full flex items-center justify-center">
                  {isVideo && (
                    <video
                      ref={videoRef}
                      src={selectedFile.url}
                      className="max-w-full max-h-full"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      style={getVideoStyle()}
                    />
                  )}
                  {isImage && (
                    <img
                      ref={imageRef}
                      src={selectedFile.url}
                      alt={selectedFile.originalName}
                      className="max-w-full max-h-full"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                      }}
                      onLoad={() => {
                        // Apply LUT to image if available
                        if (lutData && lutData.length > 0 && imageRef.current) {
                          const canvas = document.createElement('canvas');
                          const img = imageRef.current;
                          canvas.width = img.naturalWidth;
                          canvas.height = img.naturalHeight;
                          const ctx = canvas.getContext('2d');
                          
                          if (ctx) {
                            // Draw image
                            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            
                            // Apply LUT
                            applyLutToCanvas(canvas, ctx, lutData, lutIntensity);
                            
                            // Replace image with canvas result
                            img.src = canvas.toDataURL();
                          }
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FileText className="w-20 h-20 mx-auto mb-3 opacity-20" />
                  <p className="text-base">Select a file</p>
                </div>
              )}
            </div>

            {selectedFile && isVideo && (
              <div className="border-t border-white/10 p-2 space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={togglePlayPause} size="sm" className="w-16 h-8">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <div className="flex items-center gap-1 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Speed: {playbackRate === 0 ? 'Paused' : playbackRate > 0 ? `${playbackRate}x` : `${Math.abs(playbackRate)}x (Rev)`}</span>
                  </div>
                </div>

                <div className="relative">
                  <div
                    ref={timelineRef}
                    className="h-8 bg-black/40 rounded-lg relative cursor-pointer overflow-hidden"
                    onClick={(e) => {
                      if (!timelineRef.current || !videoRef.current || !duration) return;
                      const rect = timelineRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percent = x / rect.width;
                      const newTime = percent * duration;
                      videoRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }}
                  >
                    {/* Trim Segments - Show as colored bars */}
                    {selectedFile && trimSegments.filter(s => s.fileId === selectedFile.id).map((segment, idx) => (
                      <div
                        key={segment.id}
                        className="absolute top-0 bottom-0 bg-[#A88A86]/40 border-l border-r border-[#A88A86] cursor-pointer hover:bg-[#A88A86]/60 transition-colors"
                        style={{
                          left: `${(segment.start / duration) * 100}%`,
                          width: `${((segment.end - segment.start) / duration) * 100}%`
                        }}
                        title={`${segment.name}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            videoRef.current.currentTime = segment.start;
                            setCurrentTime(segment.start);
                          }
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold whitespace-nowrap opacity-80">
                          {segment.name}
                        </div>
                      </div>
                    ))}

                    {/* Markers */}
                    {selectedFile && markers.filter(m => m.fileId === selectedFile.id).map(marker => (
                      <div
                        key={marker.id}
                        className="absolute top-0 bottom-0 w-0.5 cursor-pointer hover:w-1 transition-all"
                        style={{
                          left: `${(marker.time / duration) * 100}%`,
                          backgroundColor: marker.color
                        }}
                        title={`${marker.label} - ${formatTime(marker.time)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToMarker(marker.time);
                        }}
                      />
                    ))}

                    {/* Selected Range Highlight - only show if no segments yet */}
                    {inPoint !== null && outPoint !== null && trimSegments.filter(s => s.fileId === selectedFile.id).length === 0 && (
                      <div
                        className="absolute top-0 bottom-0 bg-white/30 border-l border-r border-white/50"
                        style={{
                          left: `${(inPoint / duration) * 100}%`,
                          width: `${((outPoint - inPoint) / duration) * 100}%`
                        }}
                      />
                    )}

                    {/* Playhead */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                      <div
                        className="absolute -top-1 left-0 w-2.5 h-2.5 bg-white rounded-full transform -translate-x-1 cursor-grab"
                        onMouseDown={(e) => handleTimelineMouseDown(e, 'playhead')}
                      />
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Help */}
                  <div className="mt-1 text-xs text-gray-400 text-center">
                    <span className="font-mono bg-white/10 px-1 rounded">Space</span> Play/Pause •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">J</span> Rewind •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">K</span> Stop •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">L</span> Fast Forward •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">←/→</span> Frame •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">I</span> In •
                    <span className="font-mono bg-white/10 px-1 rounded ml-1">O</span> Out
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="resize-handle w-1 cursor-col-resize hover:w-2"
            onMouseDown={(e) => handleResizeStart('right', e)}
          />

          {/* Right Panel (Organizer) */}
          <div className="glass-dark border-l border-white/10 flex flex-col overflow-hidden" style={{ width: `${rightPanelWidth}px` }}>
            <div className="flex-1 p-2 overflow-y-auto text-xs">
              {currentTab === 'labeling' && (
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-xs">ORGANIZER</h3>
                    <Button
                      onClick={() => setEditMode(!editMode)}
                      size="sm"
                      variant="outline"
                      className={`text-xs h-6 px-2 ${editMode ? 'bg-[#A88A86] text-black' : 'bg-white/10 text-white'}`}
                    >
                      <Edit className="w-2.5 h-2.5 mr-0.5" />
                      {editMode ? 'Done' : 'Edit'}
                    </Button>
                  </div>

                  <div className="flex gap-1 mb-2">
                    {Object.keys(layoutConfigs).map((layoutKey) => (
                      <button
                        key={layoutKey}
                        onClick={() => !editMode && setActiveOrganizerTab(layoutKey)}
                        className={`flex-1 px-2 py-1 rounded-md text-xs font-semibold ${
                          activeOrganizerTab === layoutKey ? 'glass-button-active' : 'glass-button'
                        }`}
                      >
                        {editMode ? (
                          <input
                            value={layoutConfigs[layoutKey].name}
                            onChange={(e) => updateLayoutName(layoutKey, e.target.value)}
                            className="bg-transparent text-center w-full outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          layoutConfigs[layoutKey].name
                        )}
                      </button>
                    ))}
                  </div>

                  {renderOrganizerContent()}
                </div>
              )}

              {currentTab === 'edit' && (
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-xs mb-2">QUICK ACTIONS</h3>
                  
                <Button 
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setLutFile(null);
                    setLutData(null);
                    setLutIntensity(100);
                  }} 
                  variant="outline" 
                  className="w-full text-xs py-2 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-md border-2 border-transparent hover:border-red-300 focus:outline-none transition-all duration-200"
                >
                  Reset All Adjustments
                </Button>


                  {isVideo && (
                    <>
                <Button 
                  onClick={() => {
                    setInPoint(null);
                    setOutPoint(null);
                  }} 
                  variant="outline" 
                  className="w-full text-xs py-2 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-md border-2 border-transparent hover:border-red-300 focus:outline-none disabled:bg-gray-400 disabled:text-gray-600 disabled:border-gray-500 transition-all duration-200"
                  disabled={inPoint === null && outPoint === null}
                >
                  Clear Trim Points
                </Button>


              <Button 
                onClick={() => {
                  setMarkers(prev => prev.filter(m => m.fileId !== selectedFile?.id));
                  setTrimSegments(prev => prev.filter(s => s.fileId !== selectedFile?.id));
                }} 
                variant="outline" 
                className="w-full text-xs py-2 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-md border-2 border-transparent hover:border-red-300 focus:outline-none disabled:bg-gray-400 disabled:text-gray-600 disabled:border-gray-500 transition-all duration-200"
                disabled={!selectedFile || (markers.filter(m => m.fileId === selectedFile.id).length === 0 && trimSegments.filter(s => s.fileId === selectedFile.id).length === 0)}
              >
                Clear All Markers & Segments
              </Button>

                    </>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-white text-xs font-semibold mb-1">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Play/Pause</span>
                        <span className="font-mono bg-white/10 px-1 rounded">Space</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frame Back/Forward</span>
                        <span className="font-mono bg-white/10 px-1 rounded">← / →</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Set IN Point</span>
                        <span className="font-mono bg-white/10 px-1 rounded">I</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Set OUT Point</span>
                        <span className="font-mono bg-white/10 px-1 rounded">O</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rewind</span>
                        <span className="font-mono bg-white/10 px-1 rounded">J</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stop</span>
                        <span className="font-mono bg-white/10 px-1 rounded">K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fast Forward</span>
                        <span className="font-mono bg-white/10 px-1 rounded">L</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
               <h3 className="text-white font-bold text-xs mb-1 mt-2">FILE INFO</h3>
              {selectedFile && (
                <div className="space-y-1.5 text-xs">
                  <div className="glass rounded p-2">
                    <div className="text-gray-400 text-xs">Original Name</div>
                    <div className="text-white font-semibold break-all text-xs">{selectedFile.originalName}</div>
                  </div>

                  {(fileNamingPatterns[selectedFile.id] && fileNamingPatterns[selectedFile.id].length > 0) && (
                    <div className="glass rounded p-2">
                      <div className="text-gray-400 text-xs">New Name</div>
                      <div className="text-[#A88A86] font-semibold break-all text-xs">{generateNewName(selectedFile)}</div>
                    </div>
                  )}

                  <div className="glass rounded p-2">
                    <div className="text-gray-400 text-xs">File Size</div>
                    <div className="text-white text-xs">{formatFileSize(selectedFile.originalFile.size)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-2 flex-shrink-0">
              {currentTab === 'edit' && (
                <>
                  <Button onClick={handleFolderClick} className="w-full text-xs mb-1 py-1.5">
                    <Upload className="w-3 h-3 mr-1" />Add Files
                  </Button>
                  {selectedFileIndex !== null && (
                    <Button onClick={() => removeFile(selectedFileIndex)} className="w-full text-xs bg-red-600 hover:bg-red-700 py-1.5">
                      <X className="w-3 h-3 mr-1" />Remove File
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className="resize-handle h-1 cursor-row-resize hover:h-2 border-t border-white/10"
          onMouseDown={(e) => handleResizeStart('files', e)}
        />

        <div className="glass-dark border-t border-white/10 overflow-hidden flex flex-col" style={{ height: `${filesPanelHeight}px` }}>
          <div className="p-2 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold text-xs">FILES ({files.length})</h3>
            <div className="flex items-center gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="text-xs bg-white/10 border-white/20 text-white w-32 h-6"
              />
              <Button onClick={handleFolderClick} size="sm" className="text-xs h-6 px-2">
                <Upload className="w-3 h-3 mr-0.5" />Add
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
            <div className="flex gap-2 h-full">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileIndex(files.indexOf(file))}
                  className={`relative flex-shrink-0 w-24 h-full rounded-lg overflow-hidden transition-all ${
                    selectedFileIndex === files.indexOf(file)
                      ? 'ring-2 ring-[#A88A86] shadow-lg'
                      : 'glass hover:ring-1 hover:ring-white/30'
                  }`}
                >
                  {currentTab === 'sell' && (
                    <div className="absolute top-1 left-1 z-10">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded"
                        checked={sellSelectedFiles.includes(file.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectFileForSale(file.id);
                        }}
                      />
                    </div>
                  )}

                  {currentTab === 'export' && (
                    <div className="absolute top-1 left-1 z-10">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded"
                        checked={exportSelectedFiles.length === 0 || exportSelectedFiles.includes(file.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectFileForExport(file.id);
                        }}
                      />
                    </div>
                  )}

                  <div className="w-full h-16 bg-black/40 flex items-center justify-center">
                    {file.originalFile.type.startsWith('video/') ? (
                      thumbnails[file.id] ? (
                        <img src={thumbnails[file.id]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Play className="w-6 h-6 text-gray-500" />
                      )
                    ) : (
                      <FileText className="w-6 h-6 text-gray-500" />
                    )}
                  </div>

                  <div className="p-1 bg-black/60">
                    <div className="text-white text-xs font-semibold truncate">{file.nameWithoutExt}</div>
                    <div className="text-gray-400 text-xs">.{file.extension}</div>
                  </div>

                  {/* Modified condition for displaying the generated name in the carousel */}
                  {(() => {
                    const currentFilePattern = fileNamingPatterns[file.id];
                    const hasPatternToDisplay = (currentFilePattern && currentFilePattern.length > 0);

                    if (hasPatternToDisplay) {
                      return (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#A88A86]/90 px-1 py-0.5">
                          <div className="text-black text-xs font-bold truncate">→ {generateNewName(file)}</div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout Creator Modal */}
      {showLayoutCreator && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowLayoutCreator(false)}
        >
          <div 
            className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create New Layout</h2>
                <button onClick={() => setShowLayoutCreator(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Layout Name */}
              <div>
                <label className="text-white text-sm font-semibold mb-1 block">Layout Name</label>
                <Input
                  value={newLayoutForm.name}
                  onChange={(e) => setNewLayoutForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Game Day Layout"
                  className="bg-white/10 border-white/20 text-white text-sm h-8"
                />
              </div>

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-semibold">Sections & Buttons</label>
                  <Button
                    onClick={addSectionToForm}
                    size="sm"
                    className="bg-[#A88A86] hover:bg-[#9A7A76] text-black h-7 px-3 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-3">
                  {newLayoutForm.sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitleInForm(sectionIdx, e.target.value)}
                          placeholder="Section Title"
                          className="flex-1 bg-white/10 border-white/20 text-white font-semibold text-sm h-8"
                        />
                        <Button
                          onClick={() => removeSectionFromForm(sectionIdx)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-7 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        {section.buttons.map((button, buttonIdx) => (
                          <div key={buttonIdx} className="flex items-center gap-2">
                            <Input
                              value={button.label}
                              onChange={(e) => updateButtonLabelInForm(sectionIdx, buttonIdx, e.target.value)}
                              placeholder="Button Label"
                              className="flex-1 bg-white/10 border-white/20 text-white text-xs h-7"
                            />
                            <Button
                              onClick={() => removeButtonFromSectionInForm(sectionIdx, buttonIdx)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 h-7 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          onClick={() => addButtonToSectionInForm(sectionIdx)}
                          size="sm"
                          variant="outline"
                          className="w-full border-white/20 text-white text-xs h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Button
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  💡 <strong>Tip:</strong> Each button you create will add its label to your filename when clicked. 
                  Create sections like "Teams", "Players", "Actions" with relevant buttons.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-3">
              <Button
                onClick={() => setShowLayoutCreator(false)}
                variant="outline"
                className="flex-1 border-white/20 text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNewLayout}
                disabled={!newLayoutForm.name || newLayoutForm.sections.length === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm py-2"
              >
                Create Layout
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEDLModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEDLModal(false)}>
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">EDL Export</h2>
            </div>
            <div className="p-4 overflow-y-auto max-h-48">
              <Textarea
                value={edlContent}
                readOnly
                className="w-full h-48 font-mono text-xs bg-black/40 text-white border-white/20"
              />
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3">
              <Button onClick={downloadEDLFile} className="flex-1 bg-green-600 text-sm py-2">
                <Download className="w-4 h-4 mr-2" />Download
              </Button>
              <Button onClick={copyEDLToClipboard} variant="outline" className="flex-1 text-sm py-2">
                Copy
              </Button>
              <Button onClick={() => setShowEDLModal(false)} variant="outline" className="text-sm py-2">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !downloadProgress.isDownloading && setShowExportModal(false)}>
          <div className="glass rounded-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Export Files</h2>
                {!downloadProgress.isDownloading && (
                  <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {downloadProgress.isDownloading ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Downloading...</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    File {downloadProgress.current} of {downloadProgress.total}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Please don't close this window
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Files to Export</div>
                    <div className="text-[#A88A86] text-2xl font-bold">
                      {exportSelectedFiles.length > 0 ? exportSelectedFiles.length : files.length}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-2">
                    <div className="text-blue-300 text-xs font-semibold mb-1">💡 How Export Works</div>
                    <div className="text-gray-300 text-xs space-y-0.5">
                      <div>• Files will download one by one with renamed filenames</div>
                      <div>• Check your browser's download folder for the files</div>
                      <div>• Each file keeps its original quality and format</div>
                    </div>
                  </div>

                  {files.every(file => !(fileNamingPatterns[file.id] && fileNamingPatterns[file.id].length > 0)) && (
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2">
                      <p className="text-amber-300 text-xs">
                        ⚠️ No naming pattern set for any file. Go to LABELING tab to set up your filename structure.
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={startIndividualDownloads} 
                    disabled={files.length === 0 || files.every(file => !(fileNamingPatterns[file.id] && fileNamingPatterns[file.id].length > 0))}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm py-4 font-bold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {exportSelectedFiles.length > 0 ? `${exportSelectedFiles.length}` : files.length} File{(exportSelectedFiles.length > 0 ? exportSelectedFiles.length : files.length) !== 1 ? 's' : ''}
                  </Button>

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-gray-400 text-xs mb-2">Export Preview (first 5 files):</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {(exportSelectedFiles.length > 0 
                        ? files.filter(f => exportSelectedFiles.includes(f.id))
                        : files
                      ).slice(0, 5).map(file => (
                        <div key={file.id} className="bg-white/5 rounded px-2 py-1 text-xs">
                          <div className="text-gray-400 truncate">{file.originalName}</div>
                          <div className="text-[#A88A86] font-semibold truncate">→ {generateNewName(file)}</div>
                        </div>
                      ))}
                      {(exportSelectedFiles.length > 0 ? exportSelectedFiles.length : files.length) > 5 && (
                        <div className="text-gray-500 text-xs text-center py-1">
                          + {(exportSelectedFiles.length > 0 ? exportSelectedFiles.length : files.length) - 5} more...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Summary Modal */}
      {showUploadSummary && sellSelectedFiles.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Review Upload</h2>
                <button onClick={() => {
                  setShowUploadSummary(false);
                  setSellClipMode(false);
                }} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Batch Name */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-1">Batch Name</div>
                <div className="text-white font-bold text-lg">{batchName}</div>
              </div>

              {/* Files Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Files to Upload</div>
                <div className="text-2xl font-bold text-[#A88A86] mb-1">{sellSelectedFiles.length} Clips</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {sellSelectedFiles.slice(0, 5).map(fileId => {
                    const file = files.find(f => f.id === fileId);
                    return file ? (
                      <div key={fileId} className="text-sm text-gray-300 truncate">
                        • {file.originalName}
                      </div>
                    ) : null;
                  })}
                  {sellSelectedFiles.length > 5 && (
                    <div className="text-sm text-gray-400">
                      + {sellSelectedFiles.length - 5} more files...
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Pricing</div>
                {useBatchPricing ? (
                  <div>
                    <div className="text-white font-semibold text-sm">Same price for all clips</div>
                    <div className="text-xl font-bold text-green-400 mt-1">${batchPrice} per clip</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-white font-semibold text-sm mb-1">Individual Pricing</div>
                    <div className="text-sm text-gray-400">Each clip has its own price</div>
                  </div>
                )}
              </div>

              {/* Important Info */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-300 text-xs space-y-1">
                  <div className="font-semibold mb-1">📋 What happens next:</div>
                  <div>• Videos will be uploaded to cloud storage</div>
                  <div>• Thumbnails will be auto-generated</div>
                  <div>• Clips will be auto-tagged from filenames</div>
                  <div>• All clips will appear in the Marketplace</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-3">
              <Button
                onClick={() => {
                  setShowUploadSummary(false);
                  setSellClipMode(false);
                }}
                variant="outline"
                className="flex-1 border-white/20 text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpload}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm py-2"
              >
                Confirm & Upload {sellSelectedFiles.length} Clips
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress/Complete Modal */}
      {(uploadingClip || uploadComplete) && sellSelectedFiles.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="xl font-bold text-white">
                    {uploadComplete ? 'Upload Complete!' : 'Uploading Clips'}
                  </h2>
                  {!uploadComplete && batchName && (
                    <p className="text-gray-400 text-xs mt-1">
                      Batch: <span className="text-[#A88A86] font-semibold">{batchName}</span>
                    </p>
                  )}
                </div>
                {uploadComplete && (
                  <button onClick={handleCloseUploadModal} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {uploadComplete ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="xl font-bold text-white mb-2">🎉 All Done!</h3>
                  <p className="text-base text-gray-300 mb-1">
                    Successfully uploaded <span className="text-[#A88A86] font-bold">{sellSelectedFiles.length}</span> clip{sellSelectedFiles.length !== 1 ? 's' : ''} to the marketplace!
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Your clips are now live and available for purchase
                  </p>

                  <div className="max-w-xs mx-auto bg-white/10 rounded-xl p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-[#A88A86] text-xl font-bold">{sellSelectedFiles.length}</div>
                        <div className="text-gray-400 text-xs">Clips Listed</div>
                      </div>
                      <div>
                        <div className="text-[#A88A86] text-xl font-bold">{batchName.split(' ')[0]}</div>
                        <div className="text-gray-400 text-xs">Batch Name</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCloseUploadModal}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base px-8 py-3 mb-2"
                  >
                    Done
                  </Button>

                  <p className="text-xs text-gray-500">
                    View your clips in the Creator Dashboard
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="xl font-bold text-white mb-2">Uploading to Marketplace</h3>
                  <p className="text-gray-400 text-sm mb-1">
                    Processing clip {uploadProgress.current} of {uploadProgress.total}
                  </p>
                  {uploadProgress.currentFileName && (
                    <p className="text-xs text-gray-500 mb-3 truncate max-w-xs mx-auto">
                      {uploadProgress.currentFileName}
                    </p>
                  )}
                  
                  <div className="max-w-xs mx-auto">
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {Math.round((uploadProgress.current / uploadProgress.total) * 100)}% Complete
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Please don't close this window...
                  </p>
                  
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 mt-3 max-w-xs mx-auto">
                    <p className="text-xs text-green-300">
                      ✨ <strong>Google Cloud Storage:</strong> Uploading to enterprise-grade storage with no file size limits. Videos of any size are supported!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
