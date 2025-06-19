// script.js

// Define an array of song objects (our playlist)
const playlist = [
    {
        title: "Chill Lofi Beat",
        artist: "AI Music",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Example MP3 URL
        albumArt: "https://placehold.co/256x256/A78BFA/FFFFFF?text=Lofi"
    },
    {
        title: "Inspirational Cinematic",
        artist: "AI Music Studio",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        albumArt: "https://placehold.co/256x256/818CF8/FFFFFF?text=Cinematic"
    },
    {
        title: "Energetic Pop Track",
        artist: "Digital Beats",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        albumArt: "https://placehold.co/256x256/6366F1/FFFFFF?text=Pop"
    },
    {
        title: "Ambient Waves",
        artist: "Soundscape Creator",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        albumArt: "https://placehold.co/256x256/4F46E5/FFFFFF?text=Ambient"
    }
];

// Get references to DOM elements
const audio = new Audio(); // Create a new Audio object
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const albumArt = document.getElementById('album-art');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const progressScrubber = document.getElementById('progress-scrubber');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');
const playlistEl = document.getElementById('playlist');

let currentSongIndex = 0; // Index of the currently playing song
let isPlaying = false;    // Flag to track play/pause state
let isScrubbing = false;  // Flag to track if user is scrubbing the progress bar

/**
 * Loads a song into the audio player based on its index in the playlist.
 * @param {number} index - The index of the song to load.
 */
function loadSong(index) {
    // Ensure the index is within the bounds of the playlist
    if (index < 0) {
        currentSongIndex = playlist.length - 1; // Loop to the last song if going before first
    } else if (index >= playlist.length) {
        currentSongIndex = 0; // Loop to the first song if going beyond last
    } else {
        currentSongIndex = index;
    }

    const song = playlist[currentSongIndex];
    audio.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = song.albumArt;

    // If the song was playing, continue playing the new song
    if (isPlaying) {
        audio.play();
    }
    populatePlaylist(); // Re-populate playlist to highlight current song
}

/**
 * Toggles the play/pause state of the audio.
 */
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying; // Invert the state
    updatePlayPauseIcon(); // Update the icon displayed on the button
}

/**
 * Updates the play/pause icon visibility based on the `isPlaying` state.
 */
function updatePlayPauseIcon() {
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

/**
 * Plays the next song in the playlist.
 */
function playNextSong() {
    loadSong(currentSongIndex + 1);
}

/**
 * Plays the previous song in the playlist.
 */
function playPrevSong() {
    loadSong(currentSongIndex - 1);
}

/**
 * Formats time from seconds to MM:SS format.
 * @param {number} seconds - The time in seconds.
 * @returns {string} Formatted time string.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Updates the progress bar and current time display.
 */
function updateProgressBar() {
    if (!isNaN(audio.duration)) { // Ensure duration is available
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressScrubber.style.left = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
}

/**
 * Sets the audio playback position based on a click on the progress bar.
 * @param {Event} e - The click event object.
 */
function setProgressBar(e) {
    const width = progressContainer.clientWidth; // Total width of the progress bar container
    const clickX = e.offsetX; // X-coordinate of the click relative to the container
    const duration = audio.duration; // Total duration of the song
    if (!isNaN(duration)) { // Ensure duration is available before setting
        audio.currentTime = (clickX / width) * duration; // Set current time
    }
}

/**
 * Handles the start of scrubbing (mouse down on progress bar).
 * @param {Event} e - The mouse down event.
 */
function startScrubbing(e) {
    isScrubbing = true;
    // Temporarily disable time updates to prevent conflict during scrubbing
    audio.removeEventListener('timeupdate', updateProgressBar);
    setProgressBar(e); // Set initial position on click
}

/**
 * Handles scrubbing (mouse move while mouse button is down).
 * @param {Event} e - The mouse move event.
 */
function whileScrubbing(e) {
    if (isScrubbing) {
        // Ensure the event target is the container or its children for correct offsetX
        const targetElement = e.target.closest('#progress-container');
        if (targetElement) {
            const width = targetElement.clientWidth;
            // Calculate offsetX relative to the target container
            const clickX = e.clientX - targetElement.getBoundingClientRect().left;
            const duration = audio.duration;
            const newTime = (clickX / width) * duration;

            // Update visual progress and scrubber without setting audio.currentTime yet
            if (!isNaN(duration)) {
                const progressPercent = (newTime / duration) * 100;
                progressBar.style.width = `${progressPercent}%`;
                progressScrubber.style.left = `${progressPercent}%`;
                currentTimeEl.textContent = formatTime(newTime);
            }
        }
    }
}

/**
 * Handles the end of scrubbing (mouse up after mouse down on progress bar).
 * @param {Event} e - The mouse up event.
 */
function endScrubbing(e) {
    if (isScrubbing) {
        isScrubbing = false;
        // Re-enable time updates
        audio.addEventListener('timeupdate', updateProgressBar);
        // Final update of current time based on the last scrubbing position
        setProgressBar(e);
    }
}

/**
 * Populates the playlist UI from the `playlist` array.
 */
function populatePlaylist() {
    playlistEl.innerHTML = ''; // Clear existing list items
    playlist.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('flex', 'items-center', 'space-x-3', 'p-2', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-200', 'transition-colors', 'duration-150');
        if (index === currentSongIndex) {
            listItem.classList.add('bg-indigo-100', 'font-semibold', 'text-indigo-700'); // Highlight current song
        }

        listItem.innerHTML = `
            <div class="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                <img src="${song.albumArt}" alt="Album Art" class="w-full h-full object-cover">
            </div>
            <div>
                <p class="text-sm font-medium">${song.title}</p>
                <p class="text-xs text-gray-500">${song.artist}</p>
            </div>
        `;
        listItem.addEventListener('click', () => {
            loadSong(index);
            if (!isPlaying) { // Only play if not already playing, otherwise it keeps playing
                togglePlayPause();
            }
        });
        playlistEl.appendChild(listItem);
    });
}

// --- Event Listeners ---

// Play/Pause button
playPauseBtn.addEventListener('click', togglePlayPause);

// Previous song button
prevBtn.addEventListener('click', playPrevSong);

// Next song button
nextBtn.addEventListener('click', playNextSong);

// Update progress bar as song plays
audio.addEventListener('timeupdate', updateProgressBar);

// Update total duration when song metadata is loaded
audio.addEventListener('loadedmetadata', () => {
    if (!isNaN(audio.duration)) { // Ensure duration is available
        totalDurationEl.textContent = formatTime(audio.duration);
    }
});

// Autoplay next song when current song ends
audio.addEventListener('ended', () => {
    isPlaying = false; // Reset play state
    updatePlayPauseIcon();
    playNextSong(); // Automatically play the next song
    audio.play(); // Start playing the next song immediately
    isPlaying = true; // Set play state back to true for the new song
    updatePlayPauseIcon();
});

// Volume slider control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Progress bar scrubbing for desktop
progressContainer.addEventListener('mousedown', startScrubbing);
document.addEventListener('mousemove', whileScrubbing); // Listen on document for continuous scrubbing
document.addEventListener('mouseup', endScrubbing); // Listen on document to stop scrubbing anywhere

// Progress bar scrubbing for touch devices
progressContainer.addEventListener('touchstart', (e) => {
    isScrubbing = true;
    audio.removeEventListener('timeupdate', updateProgressBar);
    const touch = e.touches[0];
    // Simulate mouse click properties for setProgressBar
    setProgressBar({ offsetX: touch.clientX - progressContainer.getBoundingClientRect().left });
    e.preventDefault(); // Prevent scrolling while scrubbing
});
document.addEventListener('touchmove', (e) => {
    if (isScrubbing) {
        const touch = e.touches[0];
        const width = progressContainer.clientWidth;
        const clickX = touch.clientX - progressContainer.getBoundingClientRect().left;
        const duration = audio.duration;
        const newTime = (clickX / width) * duration;

        if (!isNaN(duration)) {
            const progressPercent = (newTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            progressScrubber.style.left = `${progressPercent}%`;
            currentTimeEl.textContent = formatTime(newTime);
        }
        e.preventDefault();
    }
});
document.addEventListener('touchend', (e) => {
    if (isScrubbing) {
        isScrubbing = false;
        audio.addEventListener('timeupdate', updateProgressBar); // Re-enable time updates
        const touch = e.changedTouches[0];
        setProgressBar({ offsetX: touch.clientX - progressContainer.getBoundingClientRect().left }); // Final update
    }
});


// Initial load of the first song and playlist
document.addEventListener('DOMContentLoaded', () => {
    loadSong(currentSongIndex);
    populatePlaylist();
});