import { useState, useRef, useEffect } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  AppBar, IconButton, Typography, MenuItem, Box, ToggleButton, Stack,
  CircularProgress, Slider, Link, Divider
} from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import RewindIcon from "@mui/icons-material/SkipPrevious";
import PauseIcon from "@mui/icons-material/Pause";
import LoopIcon from "@mui/icons-material/Loop";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeOff from "@mui/icons-material/VolumeOff";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicIcon from "@mui/icons-material/Mic";
import TrackItem from "./TrackItem";
import TabLib from "./TabLib";
import Speed from "./Speed";
import IconToggleButton from "./IconToggleButton";
import { TabEngine } from "./api";
import Logo from './Logo'
import usePlayToggle from './playhook'
import { PlayButton, TrackSelect } from "./styled"
import { LibraryMusic, YouTube } from "@mui/icons-material";
import { getBandName } from "./mix";

export default function App() {
  const apiDiv = useRef(null);
  const recent = useRef(null);
  const [api] = useState(() => new TabEngine());
  const [snapshot, updateSnapshot] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (recent.current === null)
    recent.current = loadRecent();

  api.setOnChange(onApiChange);

  // init api
  useEffect(() => {
    api.init(apiDiv.current, onApiChange);
  }, []);

  usePlayToggle(play);

  function loadTab(source) {
    if (typeof source === "string") {
      saveRecent(source);
      source = "assets/tabs/" + getBandName(source) + "/" + source;
    }

    api.loadTab(source);
  }

  function showTabLib() {
    api.closeTab();
  }

  function play() {
    api.playPause();
  }

  function rewind() {
    api.rewind();
  }

  function setSpeed(value) {
    api.speed = value;
  }

  function toggleLoop() {
    api.toggleLoop();
  }

  function toggleMute() {
    api.toggleMute();
  }

  function toggleSolo() {
    api.toggleSolo();
  }

  function onApiChange(args) {
    update();
  }

  function update() {
    updateSnapshot(snapshot + 1);
  }

  function changeVolume(e, vol) {
    e.stopPropagation();
    api.volume = vol / 20;
  }

  function onTrackChange(index) {
    api.selectTrack(index);
  }

  function saveRecent(source) {
    if (!recent.current)
      recent.current = [];

    const tabs = recent.current;
    if (tabs.includes(source)) return;

    if (tabs.length >= 6) tabs.pop();
    tabs.unshift(source);
    localStorage.recent = JSON.stringify(tabs);
  }

  function loadRecent() {
    try {
      const rec = localStorage.recent;
      if (rec) return JSON.parse(localStorage.recent);
    } catch { }
    return null;
  }

  return (
    <>
      <Stack height="100dvh" width="100vw" overflow="hidden" alignItems="center" justifyContent="center">
        <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} >
          {/* Score */}
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <div style={{ overflowY: 'auto', overflowX: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
              <div ref={apiDiv} />
            </div>
          </Box>
          {/* Loading */}
          <Stack spacing={4} padding={1} sx={{
            position: 'absolute', inset: 0, display: api.isLoading ? 'flex' : 'none',
            justifyContent: 'center', alignItems: 'center', zIndex: 2000,
            bgcolor: 'lightgrey'
          }}>
            <Logo />
            <CircularProgress color="inherit" />
            <Typography sx={{ flex: 1 }}>Loading...</Typography>
          </Stack>
          {/* Tabs lib */}
          <Box sx={{
            position: 'absolute', inset: 0, display: api.isEmpty ? 'flex' : 'none',
            justifyContent: 'center', bgcolor: 'lightgrey', zIndex: 2001
          }}>
            {<TabLib onTabSelect={loadTab} tabLib={window.g_tabFiles} recent={recent.current}
              sx={{ maxWidth: 500, width: '100%' }} />}
          </Box>
        </Box>

        {/* Bottom toolbar */}
        <AppBar position="static" color="default" variant="outlined" sx={{ flexShrink: 0, display: api.isLoaded ? 'flex' : 'none' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between"
            width="100%" maxWidth={900} mx="auto" p={0.5} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: isMobile ? 1 : 0, minWidth: isMobile ? 80 : 'auto' }}>

              {/* Files */}
              <Stack alignItems="center">
                <IconButton size="large" color="primary" onClick={showTabLib}
                  disabled={api.isEmpty} title="Tabs Library">
                  <LibraryMusic />
                </IconButton>
              </Stack>

              {/* Tracks */}
              <TrackSelect
                value={api.selectedTrackIndex < 0 ? "" : api.selectedTrackIndex}
                displayEmpty
                sx={{ width: isMobile ? 'auto' : 220 }}
                renderValue={() => <Typography sx={{ overflow: 'hidden' }}>{api.selectedTrackName}</Typography>}
                MenuProps={{
                  anchorOrigin: { vertical: 'top', horizontal: 'center' },
                  transformOrigin: { vertical: 'bottom', horizontal: 'center' },
                  PaperProps: { sx: { maxHeight: '100%' } }
                }}
                fullWidth disabled={!api.isLoaded}>
                <Stack direction="row" spacing={2} p={2} alignItems="center" justifyContent="center">
                  <Typography variant="h6">{api.tabTitle}</Typography>
                  <Link sx={{ flex: 1 }} href={`https://www.youtube.com/results?search_query=${api.tabTitleArtistString}`} target="_blank">
                    <YouTube sx={{ color: 'red' }} />
                  </Link>
                  <Slider value={api.volume * 20} max={20} sx={{ width: 100 }} onChange={changeVolume} />
                </Stack>
                <Divider />
                {api.tracks.map((track) => (
                  <MenuItem key={track.id} value={track.index}>
                    <TrackItem tracks={api.tracks} track={track} onTrackChange={onTrackChange} />
                  </MenuItem>
                ))}
              </TrackSelect>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {/* Rewind */}
              <ToggleButton onClick={rewind} disabled={!api.isLoaded}>
                <RewindIcon />
              </ToggleButton>
              {/* Play */}
              <PlayButton selected={api.isPlaying} onChange={play} disabled={!api.isLoaded} >
                {api.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </PlayButton>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center"
              display={isMobile ? 'none' : 'flex'} >
              <IconToggleButton title="Loop" selected={api.isLoop} onChange={toggleLoop}
                disabled={!api.isLoaded} iconOn={<LoopIcon />} iconOff={<LoopIcon />} />

              <IconToggleButton title="Solo" selected={api.isSolo} onChange={toggleSolo}
                disabled={!api.isLoaded} iconOn={<MicIcon />} iconOff={<MicNoneIcon />} />

              <IconToggleButton title="Mute" selected={api.isMute} onChange={toggleMute}
                disabled={!api.isLoaded} iconOn={<VolumeOff />} iconOff={<VolumeUp />} />

              <Speed title="Speed" speed={api.speed} maxSpeed={api.maxSpeed}
                onChange={setSpeed} disabled={!api.isLoaded} />

            </Stack>
          </Stack >
        </AppBar >
      </Stack >
    </>
  );
}


