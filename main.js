const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const USER_STORAGE_KEY = 'USER_CONFIG';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');
const randomSongBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.play-list');

const app = { 
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {},
    songs: [
        { 
            name: 'Blue tequila', 
            singer: 'Táo',
            path: '/audio/Blue Tequila.mp3',
            image: '/img/Blue tequila.jpg'
        },
        { 
            name: 'Day1', 
            singer: 'Honne',
            path: '/audio/HONNE - Day 1.mp3',
            image: '/img/Honne - day1.jpg'
        },
        { 
            name: 'To the moon', 
            singer: 'Hooligan',
            path: '/audio/TO THE MOON.mp3',
            image: '/img/To the moon.jpg'
        },
        { 
            name: 'In the rain', 
            singer: 'Hooligan, Kim Kunni',
            path: '/audio/In The Rain.mp3',
            image: '/img/In the rain.jpg'
        },
        { 
            name: 'Paris in the rain',  
            singer: 'Lauv',
            path: '/audio/Paris In The Rain.mp3',
            image: '/img/Paris in the rain.jpg'
        },
        { 
            name: 'Comethru', 
            singer: 'Jeremy Zucker',
            path: '/audio/Comethru.mp3',
            image: '/img/Comethru.jpg'
        },
        { 
            name: 'Sunflower', 
            singer: 'Post Malone, Swae Lee',
            path: '/audio/Sunflower.mp3',
            image: '/img/sunflower.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-set="${index}">
                <div
                    class="thumb"   
                    style="
                    background-image: url('${song.image}');
                "
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Change the cd size when user scroll up or down 
        document.onscroll = function() {
            const onScroll = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - onScroll;

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / onScroll;
        }

        // Cd animation
        const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 13000,
            iterations: Infinity
        });

        cdThumbAnimation.pause();
        // Run when the user click play
        playBtn.onclick = function() {
            if(_this.isPlaying) 
            {
                audio.pause();
            }
            else
            {
                audio.play();
            }
        }
        
        // Play song
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play();
        }
        
        // Pause song
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause();
        }

        
        // Go to next song
        nextSongBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            cdThumbAnimation.cancel();
            audio.play();
            _this.render();
            _this.scrollSongToView();
        }
        
        // Go to previous song
        prevSongBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            cdThumbAnimation.cancel();
            audio.play();
            _this.render();
            _this.scrollSongToView();
        }
        
        // Repeat the song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        
        randomSongBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomSongBtn.classList.toggle('active', _this.isRandom);
        }
        

        // When audio end
        audio.onended = function() {
            if(!_this.isRepeat) {
                _this.nextSong();
            }
            if(_this.isRandom) {
                _this.playRandomSong();
            }
            cdThumbAnimation.cancel();
            audio.play();
            _this.render();
        }

        // When click on a song
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option'))
            {   
                // Play the song that is clicked
                if(songNode) {
                    _this.currentIndex = Number(songNode.getAttribute('data-set'));
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // When click on option
                if(e.target.closest('.option')) {
                    
                }
            }
        },
        audio.ontimeupdate = function() {
            if(audio.duration)
            {
                const progressPercent = Math.floor( audio.currentTime / audio.duration * 100 );
                progress.value = progressPercent;
                progress.style.background = 'linear-gradient(to right, #ec1f55 0%, #ec1f55 ' + progressPercent + '%, #d3d3d3 ' + progressPercent + '%, #d3d3d3 100%)';
            }
        }

        progress.onchange = function(e) {
            const seekCurrentTime = Math.floor( e.target.value * audio.duration / 100 );
            audio.currentTime = seekCurrentTime;
        }
    },

    // Scroll to the current song that is playing
    scrollSongToView: function() {
        setTimeout(() => {
        if(this.currentIndex < 2)
        {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
        else {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }           
        }, 250)
    },

    loadCurrentSong: function() {
        
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },

    // Go to next song event
    nextSong: function() {
            this.currentIndex++; // Go to the next song in the array
            // Go to the first song when in the last song
            if( this.currentIndex >= this.songs.length) {
                this.currentIndex = 0;
            }
            this.loadCurrentSong();
    },

    // Go to previous song event
    prevSong: function() {
        this.currentIndex--; // Go to the previous song in the array
        // Go to the last song when in the first song
        if( this.currentIndex < 0 ) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex = 0;
        do {
            newIndex = Math.floor(Math.random() * app.songs.length);
        }
        while ( newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomSongBtn.classList.toggle('active', this.isRandom);
    },
    
    start: function () {
        // Load user configuration
        this.loadConfig();
        
        // Define object properties
        this.defineProperties();
        
        // Listen and handle DOM event
        this.handleEvent();
        
        // Load the current song that is playing
        this.loadCurrentSong();
        
        // Render the playlist
        this.render();
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomSongBtn.classList.toggle('active', this.isRandom);

    }
};

app.start();