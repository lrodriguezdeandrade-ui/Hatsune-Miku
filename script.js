document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    // Smooth Scroll on Click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Update Active Link on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));

                // Add active class to corresponding link
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');
    const galleryImages = document.querySelectorAll('.gallery-item img');

    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImg.src = img.src;
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Music Player Functionality
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const seekSlider = document.getElementById('seek-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const playlistToggle = document.getElementById('playlist-toggle');
    const playlist = document.getElementById('playlist');
    const playlistItems = document.getElementById('playlist-items');
    const trackNameEl = document.querySelector('.track-name');
    const trackArtistEl = document.querySelector('.track-artist');

    let isPlaying = false;
    let trackIndex = 0;
    let updateTimer;
    let isDragging = false; // Flag to check if user is dragging the slider
    let currTrack = document.createElement('audio');

    const trackList = [{
        name: "Miku (Lyrics)",
        artist: "Anamanaguchi",
        path: "Miku by Anamanaguchi (Lyrics Video).mp3"
    },
    {
        name: "PoPiPo",
        artist: "Hatsune Miku",
        path: "[60fps Full] PoPiPo ぽっぴっぽー - Hatsune Miku 初音ミク DIVA Dreamy theater ドリーミーシアター English Romaji.mp3"
    },
    {
        name: "Levan Polka",
        artist: "Hatsune Miku",
        path: "La canción más pegadiza del mundo ( LEVAN POLKA).mp3"
    }
    ];

    function loadTrack(trackIndex) {
        clearInterval(updateTimer);
        resetValues();

        currTrack.src = trackList[trackIndex].path;
        currTrack.load();

        trackNameEl.textContent = trackList[trackIndex].name;
        trackArtistEl.textContent = trackList[trackIndex].artist;

        updateTimer = setInterval(seekUpdate, 1000);

        currTrack.addEventListener("ended", nextTrack);

        // Highlight active song in playlist
        renderPlaylist();
    }

    function resetValues() {
        currentTimeEl.textContent = "0:00";
        totalDurationEl.textContent = "0:00";
        seekSlider.value = 0;
    }

    function playPauseTrack() {
        if (!isPlaying) playTrack();
        else pauseTrack();
    }

    function playTrack() {
        currTrack.play();
        isPlaying = true;
        playPauseBtn.innerHTML = '&#10074;&#10074;';
    }

    function pauseTrack() {
        currTrack.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '&#9654;';
    }

    function nextTrack() {
        if (trackIndex < trackList.length - 1) trackIndex += 1;
        else trackIndex = 0;
        loadTrack(trackIndex);
        playTrack();
    }

    function prevTrack() {
        if (trackIndex > 0) trackIndex -= 1;
        else trackIndex = trackList.length - 1;
        loadTrack(trackIndex);
        playTrack();
    }

    function seekTo() {
        let seekto = currTrack.duration * (seekSlider.value / 100);
        currTrack.currentTime = seekto;
    }

    function setVolume() {
        currTrack.volume = volumeSlider.value / 100;
    }

    function seekUpdate() {
        // Do not update slider if user is dragging it
        if (isDragging) return;

        let seekPosition = 0;

        if (!isNaN(currTrack.duration)) {
            seekPosition = currTrack.currentTime * (100 / currTrack.duration);
            seekSlider.value = seekPosition;

            let currentMinutes = Math.floor(currTrack.currentTime / 60);
            let currentSeconds = Math.floor(currTrack.currentTime - currentMinutes * 60);
            let durationMinutes = Math.floor(currTrack.duration / 60);
            let durationSeconds = Math.floor(currTrack.duration - durationMinutes * 60);

            if (currentSeconds < 10) {
                currentSeconds = "0" + currentSeconds;
            }
            if (durationSeconds < 10) {
                durationSeconds = "0" + durationSeconds;
            }
            if (currentMinutes < 10) {
                currentMinutes = "0" + currentMinutes;
            }
            if (durationMinutes < 10) {
                durationMinutes = "0" + durationMinutes;
            }

            currentTimeEl.textContent = currentMinutes + ":" + currentSeconds;
            totalDurationEl.textContent = durationMinutes + ":" + durationSeconds;
        }
    }

    function renderPlaylist() {
        playlistItems.innerHTML = '';
        trackList.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${track.name}</span> <span>${track.artist}</span>`;
            if (index === trackIndex) {
                li.classList.add('active-song');
            }
            li.addEventListener('click', () => {
                trackIndex = index;
                loadTrack(trackIndex);
                playTrack();
            });
            playlistItems.appendChild(li);
        });
    }

    playPauseBtn.addEventListener('click', playPauseTrack);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Improved Seek Logic
    seekSlider.addEventListener('mousedown', () => { isDragging = true; });
    seekSlider.addEventListener('touchstart', () => { isDragging = true; }); // Mobile support

    seekSlider.addEventListener('change', () => {
        isDragging = false;
        seekTo();
        if (isPlaying) currTrack.play(); // Ensure it keeps playing if it was
    });

    seekSlider.addEventListener('input', () => {
        // Optional: Update time display while dragging without seeking audio yet
        let seekto = currTrack.duration * (seekSlider.value / 100);
        let currentMinutes = Math.floor(seekto / 60);
        let currentSeconds = Math.floor(seekto - currentMinutes * 60);
        if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
        if (currentMinutes < 10) currentMinutes = "0" + currentMinutes;
        currentTimeEl.textContent = currentMinutes + ":" + currentSeconds;
    });

    volumeSlider.addEventListener('input', setVolume);
    playlistToggle.addEventListener('click', () => {
        playlist.classList.toggle('active');
    });

    // Initial load
    loadTrack(trackIndex);

    // Mini Game Logic
    let mikuCount = 5;
    let mikuCollected = 0;
    const miniMikuContainer = document.getElementById('mini-miku-container');
    const mikuCounter = document.getElementById('miku-counter');
    const mikuCountDisplay = document.getElementById('miku-count');
    const completionModal = document.getElementById('completion-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function getRandomPosition() {
        const margin = 100; // Keep away from edges
        const x = margin + Math.random() * (window.innerWidth - 2 * margin - 50);
        const y = margin + Math.random() * (window.innerHeight - 2 * margin - 50 - 100); // -100 for music player
        return { x, y };
    }

    function createMiniMiku() {
        for (let i = 0; i < mikuCount; i++) {
            const miniMiku = document.createElement('img');
            miniMiku.src = 'mini_miku.png';
            miniMiku.classList.add('mini-miku');
            miniMiku.setAttribute('data-id', i);
            
            const pos = getRandomPosition();
            miniMiku.style.left = pos.x + 'px';
            miniMiku.style.top = pos.y + 'px';
            
            // Add slight random delay for animation
            miniMiku.style.animationDelay = (Math.random() * 2) + 's';
            
            miniMiku.addEventListener('click', collectMiku);
            miniMikuContainer.appendChild(miniMiku);
        }
    }

    function collectMiku(e) {
        const miku = e.target;
        miku.classList.add('collected');
        miku.removeEventListener('click', collectMiku);
        
        mikuCollected++;
        const remaining = mikuCount - mikuCollected;
        
        // Update and show counter
        mikuCountDisplay.textContent = remaining;
        mikuCounter.classList.add('show');
        
        setTimeout(() => {
            mikuCounter.classList.remove('show');
        }, 800);
        
        // Remove the collected miku after animation
        setTimeout(() => {
            miku.remove();
        }, 500);
        
        // Check if all collected
        if (mikuCollected === mikuCount) {
            setTimeout(() => {
                showCompletionModal();
            }, 600);
        }
    }

    function showCompletionModal() {
        completionModal.classList.add('show');
    }

    closeModalBtn.addEventListener('click', () => {
        completionModal.classList.remove('show');
        // Reset game
        resetGame();
    });

    function resetGame() {
        mikuCollected = 0;
        mikuCountDisplay.textContent = mikuCount;
        miniMikuContainer.innerHTML = '';
        createMiniMiku();
    }

    // Initialize the mini game
    createMiniMiku();
});
