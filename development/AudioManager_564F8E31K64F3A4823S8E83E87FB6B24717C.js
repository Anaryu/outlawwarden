var AudioManager;

AudioManager = (function() {

  /**
  * Manages the audio playback of the game. 
  *
  * @module gs
  * @class AudioManager
  * @memberof gs
  * @constructor
   */
  function AudioManager() {

    /**
    * Stores all audio buffers.
    * @property buffers
    * @type gs.AudioBuffer[]
    * @protected
     */
    this.audioBuffers = [];

    /**
    * Stores all audio buffers by layer.
    * @property buffers
    * @type gs.AudioBuffer[]
    * @protected
     */
    this.audioBuffersByLayer = [];

    /**
    * Stores all audio buffer references for sounds.
    * @property soundReferences
    * @type gs.AudioBufferReference[]
    * @protected
     */
    this.soundReferences = {};

    /**
    * Current Music (Layer 0)
    * @property music
    * @type Object
    * @protected
     */
    this.music = null;

    /**
    * Current music volume.
    * @property musicVolume
    * @type number
    * @protected
     */
    this.musicVolume = 100;

    /**
    * Current sound volume.
    * @property soundVolume
    * @type number
    * @protected
     */
    this.soundVolume = 100;

    /**
    * Current voice volume.
    * @property voiceVolume
    * @type number
    * @protected
     */
    this.voiceVolume = 100;

    /**
    * General music volume
    * @property generalMusicVolume
    * @type number
    * @protected
     */
    this.generalMusicVolume = 100;

    /**
    * General sound volume
    * @property generalSoundVolume
    * @type number
    * @protected
     */
    this.generalSoundVolume = 100;

    /**
    * General voice volume
    * @property generalVoiceVolume
    * @type number
    * @protected
     */
    this.generalVoiceVolume = 100;

    /**
    * Stores audio layer info-data for each layer.
    * @property audioLayers
    * @type gs.AudioLayerInfo[]
    * @protected
     */
    this.audioLayers = [];
  }


  /**
  * Restores audio-playback from a specified array of audio layers.
  *
  * @method restore
  * @param {gs.AudioLayerInfo[]} layers - An array of audio layer info objects.
   */

  AudioManager.prototype.restore = function(layers) {
    var i, j, layer, len, results;
    this.audioLayers = layers;
    results = [];
    for (i = j = 0, len = layers.length; j < len; i = ++j) {
      layer = layers[i];
      if (layer && layer.playing) {
        if (layer.customData) {
          results.push(this.playMusicRandom(layer, layer.customData.fadeTime, i, layer.customData.playTime, layer.customData.playRange));
        } else {
          results.push(this.playMusic(layer, layer.fadeInTime, i));
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Loads the specified music.
  *
  * @method loadMusic
  * @param {String} name - The name of the music to load.
   */

  AudioManager.prototype.loadMusic = function(name) {
    name = name != null ? name.name || name : name;
    if (name && name.length > 0) {
      return ResourceManager.getAudioStream("Audio/Music/" + name);
    }
  };


  /**
  * Loads the specified sound.
  *
  * @method loadSound
  * @param {String} name - The name of the sound to load.
   */

  AudioManager.prototype.loadSound = function(name) {
    name = name != null ? name.name || name : name;
    if (name && name.length > 0) {
      return ResourceManager.getAudioBuffer("Audio/Sounds/" + name);
    }
  };


  /**
  * Updates a randomly played audio buffer.
  *
  * @method updateRandomAudio
  * @param {gs.AudioBuffer} buffer - The audio buffer to update.
  * @protected
   */

  AudioManager.prototype.updateRandomAudio = function(buffer) {
    var currentTime, timeLeft;
    if (buffer.customData.startTimer > 0) {
      buffer.customData.startTimer--;
      if (buffer.customData.startTimer <= 0) {
        buffer.fadeInVolume = 1.0 / (buffer.customData.fadeTime || 1);
        buffer.fadeInTime = buffer.customData.fadeTime || 1;
        buffer.fadeOutTime = buffer.customData.fadeTime || 1;
        buffer.playTime = buffer.customData.playTime.min + Math.random() * (buffer.customData.playTime.max - buffer.customData.playTime.min);
        currentTime = buffer.currentTime;
        timeLeft = buffer.duration - currentTime;
        buffer.playTime = Math.min(timeLeft * 1000 / 16.6, buffer.playTime);
        return buffer.customData.startTimer = buffer.playTime + buffer.customData.playRange.start + Math.random() * (buffer.customData.playRange.end - buffer.customData.playRange.start);
      }
    }
  };


  /**
  * Updates all audio-buffers depending on the play-type.
  *
  * @method updateAudioBuffers
  * @protected
   */

  AudioManager.prototype.updateAudioBuffers = function() {
    var buffer, j, len, ref;
    ref = this.audioBuffers;
    for (j = 0, len = ref.length; j < len; j++) {
      buffer = ref[j];
      if (buffer != null) {
        if (buffer.customData.playType === 1) {
          this.updateRandomAudio(buffer);
        }
        if (GameManager.settings.bgmVolume !== this.generalMusicVolume) {
          buffer.volume = (this.musicVolume * GameManager.settings.bgmVolume / 100) / 100;
        }
        buffer.update();
      }
    }
    if (GameManager.settings.bgmVolume !== this.generalMusicVolume) {
      return this.generalMusicVolume = GameManager.settings.bgmVolume;
    }
  };


  /**
  * Updates all audio-buffers depending on the play-type.
  *
  * @method updateAudioBuffers
  * @protected
   */

  AudioManager.prototype.updateGeneralVolume = function() {
    var k, reference, results;
    if (GameManager.settings.seVolume !== this.generalSoundVolume || GameManager.settings.voiceVolume !== this.generalVoiceVolume) {
      this.generalSoundVolume = GameManager.settings.seVolume;
      this.generalVoiceVolume = GameManager.settings.voiceVolume;
      results = [];
      for (k in this.soundReferences) {
        results.push((function() {
          var j, len, ref, results1;
          ref = this.soundReferences[k];
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            reference = ref[j];
            if (reference.voice) {
              results1.push(reference.volume = (this.voiceVolume * GameManager.settings.voiceVolume / 100) / 100);
            } else {
              results1.push(reference.volume = (this.soundVolume * GameManager.settings.seVolume / 100) / 100);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    }
  };


  /**
  * Updates the audio-playback.
  *
  * @method update
   */

  AudioManager.prototype.update = function() {
    this.updateAudioBuffers();
    return this.updateGeneralVolume();
  };


  /**
  * Changes the current music to the specified one.
  *
  * @method changeMusic
  * @param {Object} music - The music to play. If <b>null</b> the current music will stop playing.
   */

  AudioManager.prototype.changeMusic = function(music) {
    if ((music != null) && (music.name != null)) {
      if ((this.music != null) && this.music.name !== music.name) {
        return this.playMusic(music);
      } else if (this.music == null) {
        return this.playMusic(music);
      }
    } else {
      return this.stopMusic();
    }
  };


  /**
  * Prepares. 
  *
  * @method prepare
  * @param {Object} music - The music to play. If <b>null</b> the current music will stop playing.
   */

  AudioManager.prototype.prepare = function(path, volume, rate) {
    var buffer;
    buffer = ResourceManager.getAudioBuffer(path);
    if (buffer.decoded) {
      buffer.volume = volume != null ? volume / 100 : 1.0;
      buffer.playbackRate = rate != null ? rate / 100 : 1.0;
    } else {
      buffer.onFinishDecode = (function(_this) {
        return function(source) {
          source.volume = volume != null ? volume / 100 : 1.0;
          return source.playbackRate = rate != null ? rate / 100 : 1.0;
        };
      })(this);
      buffer.decode();
    }
    return buffer;
  };


  /**
  * Plays an audio resource.
  *
  * @method play
  * @param {String} path - The path to the audio resource.
  * @param {number} volume - The volume.
  * @param {number} rate - The playback rate.
  * @param {number} fadeInTime - The fade-in time in frames.
   */

  AudioManager.prototype.play = function(path, volume, rate, fadeInTime) {
    var buffer;
    buffer = ResourceManager.getAudioStream(path);
    if (buffer.decoded) {
      buffer.volume = volume != null ? volume / 100 : 1.0;
      buffer.playbackRate = rate != null ? rate / 100 : 1.0;
      if (GameManager.settings.bgmEnabled) {
        buffer.play(fadeInTime);
      }
    } else {
      buffer.onFinishDecode = (function(_this) {
        return function(source) {
          source.volume = volume != null ? volume / 100 : 1.0;
          source.playbackRate = rate != null ? rate / 100 : 1.0;
          if (GameManager.settings.bgmEnabled) {
            return source.play(fadeInTime);
          }
        };
      })(this);
      buffer.decode();
    }
    return buffer;
  };


  /**
  * Stops all sounds.
  *
  * @method stopAllSounds
   */

  AudioManager.prototype.stopAllSounds = function() {
    var k, reference, results;
    results = [];
    for (k in this.soundReferences) {
      results.push((function() {
        var j, len, ref, results1;
        ref = this.soundReferences[k];
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          reference = ref[j];
          results1.push(reference != null ? reference.stop() : void 0);
        }
        return results1;
      }).call(this));
    }
    return results;
  };


  /**
  * Stops a sound and all references of it.
  *
  * @method stopSound
  * @param {String} name - The name of the sound to stop.
   */

  AudioManager.prototype.stopSound = function(name) {
    var j, len, ref, reference, results;
    if (this.soundReferences[name] != null) {
      ref = this.soundReferences[name];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        reference = ref[j];
        results.push(reference.stop());
      }
      return results;
    }
  };


  /**
  * Stops a voice.
  *
  * @method stopVoice
  * @param {String} name - The name of the voice to stop.
   */

  AudioManager.prototype.stopVoice = function(name) {
    return this.stopSound(name);
  };


  /**
  * Stops all voices.
  *
  * @method stopAllVoices
   */

  AudioManager.prototype.stopAllVoices = function() {
    var k, reference, results;
    results = [];
    for (k in this.soundReferences) {
      results.push((function() {
        var j, len, ref, results1;
        ref = this.soundReferences[k];
        results1 = [];
        for (j = 0, len = ref.length; j < len; j++) {
          reference = ref[j];
          if (reference.voice) {
            results1.push(reference.stop());
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };


  /**
  * Plays a voice.
  *
  * @method playVoice
  * @param {String} name - The name of the voice to play.
  * @param {number} volume - The voice volume.
  * @param {number} rate - The voice playback rate.
   */

  AudioManager.prototype.playVoice = function(name, volume, rate) {
    var ref, voice;
    voice = null;
    if (GameManager.settings.voiceEnabled && !((ref = $PARAMS.preview) != null ? ref.settings.voiceDisabled : void 0)) {
      voice = this.playSound(name != null ? name.name : void 0, volume || GameManager.defaults.audio.voiceVolume, rate || GameManager.defaults.audio.voicePlaybackRate, false, true);
    }
    return voice;
  };


  /**
  * Plays a sound.
  *
  * @method playSound
  * @param {String} name - The name of the sound to play.
  * @param {number} volume - The sound's volume.
  * @param {number} rate - The sound's playback rate.
  * @param {boolean} musicEffect - Indicates if the sound should be played as a music effect. In that case, the current music
  * at audio-layer will be paused until the sound finishes playing.
  * @param {boolean} voice - Indicates if the sound should be handled as a voice.
   */

  AudioManager.prototype.playSound = function(name, volume, rate, musicEffect, voice, loopSound) {
    var buffer, j, len, r, ref, ref1, reference;
    if ((ref = $PARAMS.preview) != null ? ref.settings.soundDisabled : void 0) {
      return;
    }
    if ((name == null) || (!voice && !GameManager.settings.soundEnabled)) {
      return;
    }
    if (name.name != null) {
      volume = name.volume;
      rate = name.playbackRate;
      name = name.name;
    }
    if (name.length === 0) {
      return;
    }
    if (musicEffect) {
      this.stopMusic();
    }
    if (this.soundReferences[name] == null) {
      this.soundReferences[name] = [];
    }
    volume = volume != null ? volume : 100;
    volume *= voice ? this.generalVoiceVolume / 100 : this.generalSoundVolume / 100;
    reference = null;
    ref1 = this.soundReferences[name];
    for (j = 0, len = ref1.length; j < len; j++) {
      r = ref1[j];
      if (!r.isPlaying) {
        reference = r;
        if (musicEffect) {
          reference.onEnd = (function(_this) {
            return function() {
              return _this.resumeMusic(40);
            };
          })(this);
        }
        reference.voice = voice;
        reference.volume = volume / 100;
        reference.playbackRate = rate / 100;
        reference.loop = loopSound;
        if (voice) {
          this.voice = reference;
        }
        reference.play();
        break;
      }
    }
    if (reference == null) {
      buffer = ResourceManager.getAudioBuffer("Audio/Sounds/" + name);
      if (buffer && buffer.loaded) {
        if (buffer.decoded) {
          reference = new GS.AudioBufferReference(buffer, voice);
          if (musicEffect) {
            reference.onEnd = (function(_this) {
              return function() {
                return _this.resumeMusic(40);
              };
            })(this);
          }
          reference.volume = volume / 100;
          reference.playbackRate = rate / 100;
          reference.voice = voice;
          reference.loop = loopSound;
          reference.play();
          if (voice) {
            this.voice = reference;
          }
          this.soundReferences[name].push(reference);
        } else {
          buffer.name = name;
          buffer.onDecodeFinish = (function(_this) {
            return function(source) {
              reference = new GS.AudioBufferReference(source, voice);
              if (musicEffect) {
                reference.onEnd = function() {
                  return _this.resumeMusic(40);
                };
              }
              reference.voice = voice;
              reference.volume = volume / 100;
              reference.playbackRate = rate / 100;
              reference.loop = loopSound;
              if (voice) {
                _this.voice = reference;
              }
              reference.play();
              return _this.soundReferences[source.name].push(reference);
            };
          })(this);
          buffer.decode();
        }
      }
    }
    return reference;
  };


  /**
  * Plays a music as a random music. A random music will fade-in and fade-out
  * at random times. That can be combined with other audio-layers to create a
  * much better looping of an audio track.
  *
  * @method playMusicRandom
  * @param {Object} music - The music to play.
  * @param {number} fadeTime - The time for a single fade-in/out in frames.
  * @param {number} layer - The audio layer to use.
  * @param {gs.Range} playTime - Play-Time range like 10s to 30s.
  * @param {gs.Range} playRange - Play-Range.
   */

  AudioManager.prototype.playMusicRandom = function(music, fadeTime, layer, playTime, playRange) {
    var musicBuffer, ref, volume;
    if ((ref = $PARAMS.preview) != null ? ref.settings.musicDisabled : void 0) {
      return;
    }
    layer = layer != null ? layer : 0;
    volume = music.volume != null ? music.volume : 100;
    volume = volume * (this.generalMusicVolume / 100);
    this.musicVolume = volume;
    this.disposeMusic(layer);
    if ((music.name != null) && music.name.length > 0) {
      musicBuffer = this.play("Audio/Music/" + music.name, volume, music.rate);
      musicBuffer.loop = true;
      musicBuffer.volume = 0;
      musicBuffer.duration = Math.round(musicBuffer.duration * 1000 / 16.6);
      musicBuffer.customData.playType = 1;
      musicBuffer.customData.playTime = playTime;
      if (playRange.end === 0) {
        musicBuffer.customData.playRange = {
          start: playRange.start,
          end: musicBuffer.duration
        };
      } else {
        musicBuffer.customData.playRange = playRange;
      }
      musicBuffer.customData.fadeTime = fadeTime;
      musicBuffer.customData.startTimer = Math.round(musicBuffer.customData.playRange.start + Math.random() * (musicBuffer.customData.playRange.end - musicBuffer.customData.playRange.start));
      if (!this.audioBuffers.contains(musicBuffer)) {
        this.audioBuffers.push(musicBuffer);
      }
      this.audioBuffersByLayer[layer] = musicBuffer;
      return this.audioLayers[layer] = {
        name: music.name,
        time: music.currentTime,
        volume: music.volume,
        rate: music.playbackRate,
        fadeInTime: fadeTime,
        customData: musicBuffer.customData
      };
    }
  };


  /**
  * Plays a music.
  *
  * @method playMusic
  * @param {string|Object} name - The music to play. Can be just a name or a music data-object.
  * @param {number} volume - The music's volume in percent.
  * @param {number} rate - The music's playback rate in percent.
  * @param {number} fadeInTime - The fade-in time.
  * @param {number} layer - The layer to play the music on.
  * @param {boolean} loop - Indicates if the music should be looped
   */

  AudioManager.prototype.playMusic = function(name, volume, rate, fadeInTime, layer, loopMusic) {
    var musicBuffer, ref;
    if ((ref = $PARAMS.preview) != null ? ref.settings.musicDisabled : void 0) {
      return;
    }
    if (loopMusic == null) {
      loopMusic = true;
    }
    if ((name != null) && (name.name != null)) {
      layer = layer != null ? layer : rate || 0;
      fadeInTime = volume;
      volume = name.volume;
      rate = name.playbackRate;
      name = name.name;
    } else {
      layer = layer != null ? layer : 0;
    }
    this.disposeMusic(layer);
    this.audioLayers[layer] = {
      name: name,
      volume: volume,
      rate: rate,
      fadeInTime: fadeInTime,
      playing: true
    };
    volume = volume != null ? volume : 100;
    volume = volume * (this.generalMusicVolume / 100);
    this.musicVolume = volume;
    if ((name != null) && name.length > 0) {
      this.music = {
        name: name
      };
      musicBuffer = this.play("Audio/Music/" + name, volume, rate, fadeInTime);
      musicBuffer.loop = loopMusic;
      if (!this.audioBuffers.contains(musicBuffer)) {
        this.audioBuffers.push(musicBuffer);
      }
      this.audioBuffersByLayer[layer] = musicBuffer;
    }
    return musicBuffer;
  };


  /**
  * Resumes a paused music.
  *
  * @method resumeMusic
  * @param {number} fadeInTime - The fade-in time in frames.
  * @param {number} layer - The audio layer to resume.
   */

  AudioManager.prototype.resumeMusic = function(fadeInTime, layer) {
    var ref;
    layer = layer != null ? layer : 0;
    if ((this.audioBuffersByLayer[layer] != null) && !this.audioBuffersByLayer[layer].isPlaying) {
      this.audioBuffersByLayer[layer].resume(fadeInTime);
      return (ref = this.audioLayers[layer]) != null ? ref.playing = true : void 0;
    }
  };


  /**
  * Stops a music.
  *
  * @method stopMusic
  * @param {number} fadeOutTime - The fade-out time in frames.
  * @param {number} layer - The audio layer to stop.
   */

  AudioManager.prototype.stopMusic = function(fadeOutTime, layer) {
    var ref, ref1, ref2;
    layer = layer != null ? layer : 0;
    if ((ref = this.audioBuffersByLayer[layer]) != null) {
      ref.stop(fadeOutTime);
    }
    if ((ref1 = this.audioBuffersByLayer[layer]) != null) {
      ref1.customData = {};
    }
    if ((ref2 = this.audioLayers[layer]) != null) {
      ref2.playing = false;
    }
    return this.music = null;
  };


  /**
  * Stops all music/audio layers.
  *
  * @method stopAllMusic
  * @param {number} fadeOutTime - The fade-out time in frames.
   */

  AudioManager.prototype.stopAllMusic = function(fadeOutTime) {
    var buffer, j, len, ref;
    ref = this.audioBuffers;
    for (j = 0, len = ref.length; j < len; j++) {
      buffer = ref[j];
      if (buffer != null) {
        buffer.stop(fadeOutTime);
        buffer.customData = {};
      }
    }
    return this.music = null;
  };

  AudioManager.prototype.dispose = function(context) {
    var buffer, data, j, layer, len, ref, results;
    data = context.resources.select(function(r) {
      return r.data;
    });
    ref = this.audioBuffersByLayer;
    results = [];
    for (layer = j = 0, len = ref.length; j < len; layer = ++j) {
      buffer = ref[layer];
      if (buffer && data.indexOf(buffer) !== -1) {
        buffer.dispose();
        this.audioBuffers.remove(buffer);
        this.audioBuffersByLayer[layer] = null;
        results.push(this.audioLayers[layer] = null);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /**
  * Disposes a music.
  *
  * @method disposeMusic
  * @param {number} layer - The audio layer of the music to dispose.
   */

  AudioManager.prototype.disposeMusic = function(layer) {
    layer = layer != null ? layer : 0;
    this.stopMusic(0, layer);
    this.audioBuffers.remove(this.audioBuffersByLayer[layer]);
    this.audioBuffersByLayer[layer] = null;
    return this.audioLayers[layer] = null;
  };

  return AudioManager;

})();

window.AudioManager = new AudioManager();

gs.AudioManager = AudioManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLElBQUE7O0FBQU07O0FBQ0Y7Ozs7Ozs7O0VBUWEsc0JBQUE7O0FBQ1Q7Ozs7OztJQU1BLElBQUMsQ0FBQSxZQUFELEdBQWdCOztBQUVoQjs7Ozs7O0lBTUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCOztBQUV2Qjs7Ozs7O0lBTUEsSUFBQyxDQUFBLGVBQUQsR0FBbUI7O0FBRW5COzs7Ozs7SUFNQSxJQUFDLENBQUEsS0FBRCxHQUFTOztBQUVUOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlOztBQUVmOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsa0JBQUQsR0FBc0I7O0FBRXRCOzs7Ozs7SUFNQSxJQUFDLENBQUEsV0FBRCxHQUFlO0VBdkZOOzs7QUF5RmI7Ozs7Ozs7eUJBTUEsT0FBQSxHQUFTLFNBQUMsTUFBRDtBQUNMLFFBQUE7SUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlO0FBRWY7U0FBQSxnREFBQTs7TUFDSSxJQUFHLEtBQUEsSUFBVSxLQUFLLENBQUMsT0FBbkI7UUFDSSxJQUFHLEtBQUssQ0FBQyxVQUFUO3VCQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCLEVBQXdCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBekMsRUFBbUQsQ0FBbkQsRUFBc0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUF2RSxFQUFpRixLQUFLLENBQUMsVUFBVSxDQUFDLFNBQWxHLEdBREo7U0FBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxTQUFELENBQVcsS0FBWCxFQUFrQixLQUFLLENBQUMsVUFBeEIsRUFB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R0FBYyxTQUFDLEtBQUQ7SUFDVixLQUFBLG1CQUFRLFFBQVE7SUFFaEIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWMsS0FBZDtJQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsbUJBQW9CLENBQUEsS0FBQSxDQUExQztJQUNBLElBQUMsQ0FBQSxtQkFBb0IsQ0FBQSxLQUFBLENBQXJCLEdBQThCO1dBQzlCLElBQUMsQ0FBQSxXQUFZLENBQUEsS0FBQSxDQUFiLEdBQXNCO0VBUFo7Ozs7OztBQVNsQixNQUFNLENBQUMsWUFBUCxHQUEwQixJQUFBLFlBQUEsQ0FBQTs7QUFDMUIsRUFBRSxDQUFDLFlBQUgsR0FBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgICBTY3JpcHQ6IEF1ZGlvTWFuYWdlclxuI1xuIyAgICQkQ09QWVJJR0hUJCRcbiNcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQXVkaW9NYW5hZ2VyXG4gICAgIyMjKlxuICAgICogTWFuYWdlcyB0aGUgYXVkaW8gcGxheWJhY2sgb2YgdGhlIGdhbWUuIFxuICAgICpcbiAgICAqIEBtb2R1bGUgZ3NcbiAgICAqIEBjbGFzcyBBdWRpb01hbmFnZXJcbiAgICAqIEBtZW1iZXJvZiBnc1xuICAgICogQGNvbnN0cnVjdG9yXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgYWxsIGF1ZGlvIGJ1ZmZlcnMuXG4gICAgICAgICogQHByb3BlcnR5IGJ1ZmZlcnNcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0J1ZmZlcltdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgIFxuICAgICAgICBAYXVkaW9CdWZmZXJzID0gW11cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBTdG9yZXMgYWxsIGF1ZGlvIGJ1ZmZlcnMgYnkgbGF5ZXIuXG4gICAgICAgICogQHByb3BlcnR5IGJ1ZmZlcnNcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0J1ZmZlcltdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgIFxuICAgICAgICBAYXVkaW9CdWZmZXJzQnlMYXllciA9IFtdXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGFsbCBhdWRpbyBidWZmZXIgcmVmZXJlbmNlcyBmb3Igc291bmRzLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzb3VuZFJlZmVyZW5jZXNcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0J1ZmZlclJlZmVyZW5jZVtdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgIFxuICAgICAgICBAc291bmRSZWZlcmVuY2VzID0ge31cbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IE11c2ljIChMYXllciAwKVxuICAgICAgICAqIEBwcm9wZXJ0eSBtdXNpY1xuICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjIFxuICAgICAgICBAbXVzaWMgPSBudWxsXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogQ3VycmVudCBtdXNpYyB2b2x1bWUuXG4gICAgICAgICogQHByb3BlcnR5IG11c2ljVm9sdW1lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgXG4gICAgICAgIEBtdXNpY1ZvbHVtZSA9IDEwMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEN1cnJlbnQgc291bmQgdm9sdW1lLlxuICAgICAgICAqIEBwcm9wZXJ0eSBzb3VuZFZvbHVtZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjIFxuICAgICAgICBAc291bmRWb2x1bWUgPSAxMDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBDdXJyZW50IHZvaWNlIHZvbHVtZS5cbiAgICAgICAgKiBAcHJvcGVydHkgdm9pY2VWb2x1bWVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjIyBcbiAgICAgICAgQHZvaWNlVm9sdW1lID0gMTAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogR2VuZXJhbCBtdXNpYyB2b2x1bWVcbiAgICAgICAgKiBAcHJvcGVydHkgZ2VuZXJhbE11c2ljVm9sdW1lXG4gICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgXG4gICAgICAgIEBnZW5lcmFsTXVzaWNWb2x1bWUgPSAxMDBcbiAgICAgICAgXG4gICAgICAgICMjIypcbiAgICAgICAgKiBHZW5lcmFsIHNvdW5kIHZvbHVtZVxuICAgICAgICAqIEBwcm9wZXJ0eSBnZW5lcmFsU291bmRWb2x1bWVcbiAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICMjIyBcbiAgICAgICAgQGdlbmVyYWxTb3VuZFZvbHVtZSA9IDEwMFxuICAgICAgICBcbiAgICAgICAgIyMjKlxuICAgICAgICAqIEdlbmVyYWwgdm9pY2Ugdm9sdW1lXG4gICAgICAgICogQHByb3BlcnR5IGdlbmVyYWxWb2ljZVZvbHVtZVxuICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgIyMjIFxuICAgICAgICBAZ2VuZXJhbFZvaWNlVm9sdW1lID0gMTAwXG4gICAgICAgIFxuICAgICAgICAjIyMqXG4gICAgICAgICogU3RvcmVzIGF1ZGlvIGxheWVyIGluZm8tZGF0YSBmb3IgZWFjaCBsYXllci5cbiAgICAgICAgKiBAcHJvcGVydHkgYXVkaW9MYXllcnNcbiAgICAgICAgKiBAdHlwZSBncy5BdWRpb0xheWVySW5mb1tdXG4gICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAjIyMgXG4gICAgICAgIEBhdWRpb0xheWVycyA9IFtdXG4gICAgICBcbiAgICAjIyMqXG4gICAgKiBSZXN0b3JlcyBhdWRpby1wbGF5YmFjayBmcm9tIGEgc3BlY2lmaWVkIGFycmF5IG9mIGF1ZGlvIGxheWVycy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHJlc3RvcmVcbiAgICAqIEBwYXJhbSB7Z3MuQXVkaW9MYXllckluZm9bXX0gbGF5ZXJzIC0gQW4gYXJyYXkgb2YgYXVkaW8gbGF5ZXIgaW5mbyBvYmplY3RzLlxuICAgICMjIyAgXG4gICAgcmVzdG9yZTogKGxheWVycykgLT5cbiAgICAgICAgQGF1ZGlvTGF5ZXJzID0gbGF5ZXJzXG4gICAgICAgIFxuICAgICAgICBmb3IgbGF5ZXIsIGkgaW4gbGF5ZXJzXG4gICAgICAgICAgICBpZiBsYXllciBhbmQgbGF5ZXIucGxheWluZ1xuICAgICAgICAgICAgICAgIGlmIGxheWVyLmN1c3RvbURhdGFcbiAgICAgICAgICAgICAgICAgICAgQHBsYXlNdXNpY1JhbmRvbShsYXllciwgbGF5ZXIuY3VzdG9tRGF0YS5mYWRlVGltZSwgaSwgbGF5ZXIuY3VzdG9tRGF0YS5wbGF5VGltZSwgbGF5ZXIuY3VzdG9tRGF0YS5wbGF5UmFuZ2UpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAcGxheU11c2ljKGxheWVyLCBsYXllci5mYWRlSW5UaW1lLCBpKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBMb2FkcyB0aGUgc3BlY2lmaWVkIG11c2ljLlxuICAgICpcbiAgICAqIEBtZXRob2QgbG9hZE11c2ljXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtdXNpYyB0byBsb2FkLlxuICAgICMjIyAgICBcbiAgICBsb2FkTXVzaWM6IChuYW1lKSAtPiBcbiAgICAgICAgbmFtZSA9IGlmIG5hbWU/IHRoZW4gKG5hbWUubmFtZSB8fCBuYW1lKSBlbHNlIG5hbWVcbiAgICAgICAgaWYgbmFtZSBhbmQgbmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuZ2V0QXVkaW9TdHJlYW0oXCJBdWRpby9NdXNpYy8je25hbWV9XCIpXG4gICAgIFxuICAgICMjIypcbiAgICAqIExvYWRzIHRoZSBzcGVjaWZpZWQgc291bmQuXG4gICAgKlxuICAgICogQG1ldGhvZCBsb2FkU291bmRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNvdW5kIHRvIGxvYWQuXG4gICAgIyMjICAgICAgICAgICBcbiAgICBsb2FkU291bmQ6IChuYW1lKSAtPiBcbiAgICAgICAgbmFtZSA9IGlmIG5hbWU/IHRoZW4gbmFtZS5uYW1lIHx8IG5hbWUgZWxzZSBuYW1lXG4gICAgICAgIGlmIG5hbWUgYW5kIG5hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiQXVkaW8vU291bmRzLyN7bmFtZX1cIilcbiAgICBcbiAgICAjIyMqXG4gICAgKiBVcGRhdGVzIGEgcmFuZG9tbHkgcGxheWVkIGF1ZGlvIGJ1ZmZlci5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHVwZGF0ZVJhbmRvbUF1ZGlvXG4gICAgKiBAcGFyYW0ge2dzLkF1ZGlvQnVmZmVyfSBidWZmZXIgLSBUaGUgYXVkaW8gYnVmZmVyIHRvIHVwZGF0ZS5cbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgXG4gICAgIyBGSVhNRTogUmVmYWN0b3JpbmcgbmVjZXNzYXJ5LiAgICAgIFxuICAgIHVwZGF0ZVJhbmRvbUF1ZGlvOiAoYnVmZmVyKSAtPlxuICAgICAgICBpZiBidWZmZXIuY3VzdG9tRGF0YS5zdGFydFRpbWVyID4gMFxuICAgICAgICAgICAgYnVmZmVyLmN1c3RvbURhdGEuc3RhcnRUaW1lci0tXG4gICAgICAgICAgICBpZiBidWZmZXIuY3VzdG9tRGF0YS5zdGFydFRpbWVyIDw9IDBcbiAgICAgICAgICAgICAgICBidWZmZXIuZmFkZUluVm9sdW1lID0gMS4wIC8gKGJ1ZmZlci5jdXN0b21EYXRhLmZhZGVUaW1lfHwxKVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5mYWRlSW5UaW1lID0gYnVmZmVyLmN1c3RvbURhdGEuZmFkZVRpbWV8fDFcbiAgICAgICAgICAgICAgICBidWZmZXIuZmFkZU91dFRpbWUgPSBidWZmZXIuY3VzdG9tRGF0YS5mYWRlVGltZXx8MVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wbGF5VGltZSA9IGJ1ZmZlci5jdXN0b21EYXRhLnBsYXlUaW1lLm1pbiArIE1hdGgucmFuZG9tKCkgKiAoYnVmZmVyLmN1c3RvbURhdGEucGxheVRpbWUubWF4IC0gYnVmZmVyLmN1c3RvbURhdGEucGxheVRpbWUubWluKVxuICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gYnVmZmVyLmN1cnJlbnRUaW1lICMgLSBidWZmZXIuc3RhcnRUaW1lXG4gICAgICAgICAgICAgICAgdGltZUxlZnQgPSBidWZmZXIuZHVyYXRpb24gLSBjdXJyZW50VGltZVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wbGF5VGltZSA9IE1hdGgubWluKHRpbWVMZWZ0ICogMTAwMCAvIDE2LjYsIGJ1ZmZlci5wbGF5VGltZSlcbiAgICBcbiAgICAgICAgICAgICAgICBidWZmZXIuY3VzdG9tRGF0YS5zdGFydFRpbWVyID0gYnVmZmVyLnBsYXlUaW1lICsgYnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLnN0YXJ0ICsgTWF0aC5yYW5kb20oKSAqIChidWZmZXIuY3VzdG9tRGF0YS5wbGF5UmFuZ2UuZW5kIC0gYnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLnN0YXJ0KVxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYWxsIGF1ZGlvLWJ1ZmZlcnMgZGVwZW5kaW5nIG9uIHRoZSBwbGF5LXR5cGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVBdWRpb0J1ZmZlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICBcbiAgICB1cGRhdGVBdWRpb0J1ZmZlcnM6IC0+XG4gICAgICAgIGZvciBidWZmZXIgaW4gQGF1ZGlvQnVmZmVyc1xuICAgICAgICAgICAgaWYgYnVmZmVyP1xuICAgICAgICAgICAgICAgIGlmIGJ1ZmZlci5jdXN0b21EYXRhLnBsYXlUeXBlID09IDFcbiAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZVJhbmRvbUF1ZGlvKGJ1ZmZlcilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgR2FtZU1hbmFnZXIuc2V0dGluZ3MuYmdtVm9sdW1lICE9IEBnZW5lcmFsTXVzaWNWb2x1bWVcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnZvbHVtZSA9IChAbXVzaWNWb2x1bWUgKiBHYW1lTWFuYWdlci5zZXR0aW5ncy5iZ21Wb2x1bWUgLyAxMDApIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJ1ZmZlci51cGRhdGUoKVxuICAgICAgICBpZiBHYW1lTWFuYWdlci5zZXR0aW5ncy5iZ21Wb2x1bWUgIT0gQGdlbmVyYWxNdXNpY1ZvbHVtZVxuICAgICAgICAgICAgQGdlbmVyYWxNdXNpY1ZvbHVtZSA9IEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbVZvbHVtZVxuICAgIFxuICAgIFxuICAgICMjIypcbiAgICAqIFVwZGF0ZXMgYWxsIGF1ZGlvLWJ1ZmZlcnMgZGVwZW5kaW5nIG9uIHRoZSBwbGF5LXR5cGUuXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVBdWRpb0J1ZmZlcnNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAjIyMgICAgICAgICAgICAgXG4gICAgdXBkYXRlR2VuZXJhbFZvbHVtZTogLT5cbiAgICAgICAgaWYgR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2VWb2x1bWUgIT0gQGdlbmVyYWxTb3VuZFZvbHVtZSBvciBHYW1lTWFuYWdlci5zZXR0aW5ncy52b2ljZVZvbHVtZSAhPSBAZ2VuZXJhbFZvaWNlVm9sdW1lXG4gICAgICAgICAgICBAZ2VuZXJhbFNvdW5kVm9sdW1lID0gR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2VWb2x1bWVcbiAgICAgICAgICAgIEBnZW5lcmFsVm9pY2VWb2x1bWUgPSBHYW1lTWFuYWdlci5zZXR0aW5ncy52b2ljZVZvbHVtZVxuICAgICAgICAgICAgZm9yIGsgb2YgQHNvdW5kUmVmZXJlbmNlc1xuICAgICAgICAgICAgICAgIGZvciByZWZlcmVuY2UgaW4gQHNvdW5kUmVmZXJlbmNlc1trXVxuICAgICAgICAgICAgICAgICAgICBpZiByZWZlcmVuY2Uudm9pY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS52b2x1bWUgPSAoQHZvaWNlVm9sdW1lICogR2FtZU1hbmFnZXIuc2V0dGluZ3Mudm9pY2VWb2x1bWUgLyAxMDApIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS52b2x1bWUgPSAoQHNvdW5kVm9sdW1lICogR2FtZU1hbmFnZXIuc2V0dGluZ3Muc2VWb2x1bWUgLyAxMDApIC8gMTAwXG4gICAgIyMjKlxuICAgICogVXBkYXRlcyB0aGUgYXVkaW8tcGxheWJhY2suXG4gICAgKlxuICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAjIyMgICAgICAgICAgICAgICAgXG4gICAgdXBkYXRlOiAtPlxuICAgICAgICBAdXBkYXRlQXVkaW9CdWZmZXJzKClcbiAgICAgICAgQHVwZGF0ZUdlbmVyYWxWb2x1bWUoKVxuICAgICBcbiAgICAjIyMqXG4gICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IG11c2ljIHRvIHRoZSBzcGVjaWZpZWQgb25lLlxuICAgICpcbiAgICAqIEBtZXRob2QgY2hhbmdlTXVzaWNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBtdXNpYyAtIFRoZSBtdXNpYyB0byBwbGF5LiBJZiA8Yj5udWxsPC9iPiB0aGUgY3VycmVudCBtdXNpYyB3aWxsIHN0b3AgcGxheWluZy5cbiAgICAjIyMgICAgICAgICAgIFxuICAgIGNoYW5nZU11c2ljOiAobXVzaWMpIC0+XG4gICAgICAgIGlmIG11c2ljPyBhbmQgbXVzaWMubmFtZT9cbiAgICAgICAgICAgIGlmIEBtdXNpYz8gYW5kIEBtdXNpYy5uYW1lICE9IG11c2ljLm5hbWVcbiAgICAgICAgICAgICAgICBAcGxheU11c2ljKG11c2ljKVxuICAgICAgICAgICAgZWxzZSBpZiBub3QgQG11c2ljP1xuICAgICAgICAgICAgICAgIEBwbGF5TXVzaWMobXVzaWMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wTXVzaWMoKVxuICAgICBcbiAgICAjIEZJWE1FOiBJcyB0aGlzIHN0aWxsIHVzZWQ/XG4gICAgIyMjKlxuICAgICogUHJlcGFyZXMuIFxuICAgICpcbiAgICAqIEBtZXRob2QgcHJlcGFyZVxuICAgICogQHBhcmFtIHtPYmplY3R9IG11c2ljIC0gVGhlIG11c2ljIHRvIHBsYXkuIElmIDxiPm51bGw8L2I+IHRoZSBjdXJyZW50IG11c2ljIHdpbGwgc3RvcCBwbGF5aW5nLlxuICAgICMjIyAgICAgICAgICAgIFxuICAgIHByZXBhcmU6IChwYXRoLCB2b2x1bWUsIHJhdGUpIC0+IFxuICAgICAgICBidWZmZXIgPSBSZXNvdXJjZU1hbmFnZXIuZ2V0QXVkaW9CdWZmZXIocGF0aClcbiAgICAgICAgXG4gICAgICAgIGlmIGJ1ZmZlci5kZWNvZGVkXG4gICAgICAgICAgICBidWZmZXIudm9sdW1lID0gaWYgdm9sdW1lPyB0aGVuIHZvbHVtZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICAgYnVmZmVyLnBsYXliYWNrUmF0ZSA9IGlmIHJhdGU/IHRoZW4gcmF0ZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgIGJ1ZmZlci5vbkZpbmlzaERlY29kZSA9IChzb3VyY2UpID0+IFxuICAgICAgICAgICAgICAgc291cmNlLnZvbHVtZSA9IGlmIHZvbHVtZT8gdGhlbiB2b2x1bWUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUgPSBpZiByYXRlPyB0aGVuIHJhdGUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgYnVmZmVyLmRlY29kZSgpXG4gICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYnVmZmVyXG4gICAgICAgIFxuICAgICMjIypcbiAgICAqIFBsYXlzIGFuIGF1ZGlvIHJlc291cmNlLlxuICAgICpcbiAgICAqIEBtZXRob2QgcGxheVxuICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBUaGUgcGF0aCB0byB0aGUgYXVkaW8gcmVzb3VyY2UuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdm9sdW1lIC0gVGhlIHZvbHVtZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByYXRlIC0gVGhlIHBsYXliYWNrIHJhdGUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZmFkZUluVGltZSAtIFRoZSBmYWRlLWluIHRpbWUgaW4gZnJhbWVzLlxuICAgICMjIyAgICAgXG4gICAgcGxheTogKHBhdGgsIHZvbHVtZSwgcmF0ZSwgZmFkZUluVGltZSkgLT5cbiAgICAgICAgYnVmZmVyID0gUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvU3RyZWFtKHBhdGgpXG4gICAgXG4gICAgICAgIGlmIGJ1ZmZlci5kZWNvZGVkXG4gICAgICAgICAgICBidWZmZXIudm9sdW1lID0gaWYgdm9sdW1lPyB0aGVuIHZvbHVtZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICAgYnVmZmVyLnBsYXliYWNrUmF0ZSA9IGlmIHJhdGU/IHRoZW4gcmF0ZSAvIDEwMCBlbHNlIDEuMFxuICAgICAgICAgICAgYnVmZmVyLnBsYXkoZmFkZUluVGltZSkgaWYgR2FtZU1hbmFnZXIuc2V0dGluZ3MuYmdtRW5hYmxlZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgIGJ1ZmZlci5vbkZpbmlzaERlY29kZSA9IChzb3VyY2UpID0+IFxuICAgICAgICAgICAgICAgc291cmNlLnZvbHVtZSA9IGlmIHZvbHVtZT8gdGhlbiB2b2x1bWUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUgPSBpZiByYXRlPyB0aGVuIHJhdGUgLyAxMDAgZWxzZSAxLjBcbiAgICAgICAgICAgICAgIHNvdXJjZS5wbGF5KGZhZGVJblRpbWUpIGlmIEdhbWVNYW5hZ2VyLnNldHRpbmdzLmJnbUVuYWJsZWRcbiAgICAgICAgICAgYnVmZmVyLmRlY29kZSgpXG4gICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYnVmZmVyXG4gICAgIFxuICAgICMjIypcbiAgICAqIFN0b3BzIGFsbCBzb3VuZHMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wQWxsU291bmRzXG4gICAgIyMjICAgIFxuICAgIHN0b3BBbGxTb3VuZHM6IC0+XG4gICAgICAgIGZvciBrIG9mIEBzb3VuZFJlZmVyZW5jZXNcbiAgICAgICAgICAgIGZvciByZWZlcmVuY2UgaW4gQHNvdW5kUmVmZXJlbmNlc1trXVxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZT8uc3RvcCgpXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSBzb3VuZCBhbmQgYWxsIHJlZmVyZW5jZXMgb2YgaXQuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wU291bmRcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNvdW5kIHRvIHN0b3AuXG4gICAgIyMjICAgICAgICAgICAgIFxuICAgIHN0b3BTb3VuZDogKG5hbWUpIC0+XG4gICAgICAgIGlmIEBzb3VuZFJlZmVyZW5jZXNbbmFtZV0/XG4gICAgICAgICAgICBmb3IgcmVmZXJlbmNlIGluIEBzb3VuZFJlZmVyZW5jZXNbbmFtZV1cbiAgICAgICAgICAgICAgICByZWZlcmVuY2Uuc3RvcCgpXG4gICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSB2b2ljZS5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BWb2ljZVxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdm9pY2UgdG8gc3RvcC5cbiAgICAjIyMgICAgICAgICAgICAgXG4gICAgc3RvcFZvaWNlOiAobmFtZSkgLT5cbiAgICAgICAgQHN0b3BTb3VuZChuYW1lKVxuICAgIFxuICAgICMjIypcbiAgICAqIFN0b3BzIGFsbCB2b2ljZXMuXG4gICAgKlxuICAgICogQG1ldGhvZCBzdG9wQWxsVm9pY2VzXG4gICAgIyMjICAgICBcbiAgICBzdG9wQWxsVm9pY2VzOiAtPlxuICAgICAgICBmb3IgayBvZiBAc291bmRSZWZlcmVuY2VzXG4gICAgICAgICAgICBmb3IgcmVmZXJlbmNlIGluIEBzb3VuZFJlZmVyZW5jZXNba11cbiAgICAgICAgICAgICAgICByZWZlcmVuY2Uuc3RvcCgpIGlmIHJlZmVyZW5jZS52b2ljZVxuICAgIFxuICAgICMjIypcbiAgICAqIFBsYXlzIGEgdm9pY2UuXG4gICAgKlxuICAgICogQG1ldGhvZCBwbGF5Vm9pY2VcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHZvaWNlIHRvIHBsYXkuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gdm9sdW1lIC0gVGhlIHZvaWNlIHZvbHVtZS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByYXRlIC0gVGhlIHZvaWNlIHBsYXliYWNrIHJhdGUuXG4gICAgIyMjICAgICBcbiAgICBwbGF5Vm9pY2U6IChuYW1lLCB2b2x1bWUsIHJhdGUpIC0+XG4gICAgICAgIHZvaWNlID0gbnVsbFxuICAgICAgICBpZiBHYW1lTWFuYWdlci5zZXR0aW5ncy52b2ljZUVuYWJsZWQgYW5kIG5vdCAkUEFSQU1TLnByZXZpZXc/LnNldHRpbmdzLnZvaWNlRGlzYWJsZWRcbiAgICAgICAgICAgIHZvaWNlID0gQHBsYXlTb3VuZChuYW1lPy5uYW1lLCB2b2x1bWUgfHwgR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW8udm9pY2VWb2x1bWUsIHJhdGUgfHwgR2FtZU1hbmFnZXIuZGVmYXVsdHMuYXVkaW8udm9pY2VQbGF5YmFja1JhdGUsIG5vLCB5ZXMpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdm9pY2UgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogUGxheXMgYSBzb3VuZC5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBsYXlTb3VuZFxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgc291bmQgdG8gcGxheS5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2b2x1bWUgLSBUaGUgc291bmQncyB2b2x1bWUuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmF0ZSAtIFRoZSBzb3VuZCdzIHBsYXliYWNrIHJhdGUuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IG11c2ljRWZmZWN0IC0gSW5kaWNhdGVzIGlmIHRoZSBzb3VuZCBzaG91bGQgYmUgcGxheWVkIGFzIGEgbXVzaWMgZWZmZWN0LiBJbiB0aGF0IGNhc2UsIHRoZSBjdXJyZW50IG11c2ljXG4gICAgKiBhdCBhdWRpby1sYXllciB3aWxsIGJlIHBhdXNlZCB1bnRpbCB0aGUgc291bmQgZmluaXNoZXMgcGxheWluZy5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdm9pY2UgLSBJbmRpY2F0ZXMgaWYgdGhlIHNvdW5kIHNob3VsZCBiZSBoYW5kbGVkIGFzIGEgdm9pY2UuXG4gICAgIyMjICAgICAgICAgIFxuICAgIHBsYXlTb3VuZDogKG5hbWUsIHZvbHVtZSwgcmF0ZSwgbXVzaWNFZmZlY3QsIHZvaWNlLCBsb29wU291bmQpIC0+XG4gICAgICAgIGlmICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3Muc291bmREaXNhYmxlZCB0aGVuIHJldHVyblxuICAgICAgICBpZiBub3QgbmFtZT8gb3IgKCF2b2ljZSBhbmQgIUdhbWVNYW5hZ2VyLnNldHRpbmdzLnNvdW5kRW5hYmxlZCkgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgbmFtZS5uYW1lP1xuICAgICAgICAgICAgdm9sdW1lID0gbmFtZS52b2x1bWVcbiAgICAgICAgICAgIHJhdGUgPSBuYW1lLnBsYXliYWNrUmF0ZVxuICAgICAgICAgICAgbmFtZSA9IG5hbWUubmFtZVxuICAgICAgICAgXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoID09IDAgdGhlbiByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmIG11c2ljRWZmZWN0XG4gICAgICAgICAgICBAc3RvcE11c2ljKClcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAc291bmRSZWZlcmVuY2VzW25hbWVdP1xuICAgICAgICAgICAgQHNvdW5kUmVmZXJlbmNlc1tuYW1lXSA9IFtdXG4gICAgICAgIFxuICAgICAgICB2b2x1bWUgPSB2b2x1bWUgPyAxMDBcbiAgICAgICAgdm9sdW1lICo9IGlmIHZvaWNlIHRoZW4gQGdlbmVyYWxWb2ljZVZvbHVtZSAvIDEwMCBlbHNlIEBnZW5lcmFsU291bmRWb2x1bWUgLyAxMDBcbiAgICAgICAgXG4gICAgICAgIHJlZmVyZW5jZSA9IG51bGxcbiAgICAgICAgZm9yIHIgaW4gQHNvdW5kUmVmZXJlbmNlc1tuYW1lXVxuICAgICAgICAgICAgaWYgbm90IHIuaXNQbGF5aW5nXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlID0gclxuICAgICAgICAgICAgICAgIGlmIG11c2ljRWZmZWN0IHRoZW4gcmVmZXJlbmNlLm9uRW5kID0gPT4gQHJlc3VtZU11c2ljKDQwKVxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS52b2ljZSA9IHZvaWNlXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvbHVtZSA9IHZvbHVtZSAvIDEwMFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5wbGF5YmFja1JhdGUgPSByYXRlIC8gMTAwXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlLmxvb3AgPSBsb29wU291bmRcbiAgICAgICAgICAgICAgICBAdm9pY2UgPSByZWZlcmVuY2UgaWYgdm9pY2VcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgIFxuICAgICAgICBpZiBub3QgcmVmZXJlbmNlP1xuICAgICAgICAgICAgYnVmZmVyID0gUmVzb3VyY2VNYW5hZ2VyLmdldEF1ZGlvQnVmZmVyKFwiQXVkaW8vU291bmRzLyN7bmFtZX1cIilcbiAgICAgICAgICAgIGlmIGJ1ZmZlciBhbmQgYnVmZmVyLmxvYWRlZFxuICAgICAgICAgICAgICAgIGlmIGJ1ZmZlci5kZWNvZGVkXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBHUy5BdWRpb0J1ZmZlclJlZmVyZW5jZShidWZmZXIsIHZvaWNlKVxuICAgICAgICAgICAgICAgICAgICBpZiBtdXNpY0VmZmVjdCB0aGVuIHJlZmVyZW5jZS5vbkVuZCA9ID0+IEByZXN1bWVNdXNpYyg0MClcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvbHVtZSA9IHZvbHVtZSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheWJhY2tSYXRlID0gcmF0ZSAvIDEwMFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2Uudm9pY2UgPSB2b2ljZVxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UubG9vcCA9IGxvb3BTb3VuZFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheSgpXG4gICAgICAgICAgICAgICAgICAgIEB2b2ljZSA9IHJlZmVyZW5jZSBpZiB2b2ljZVxuICAgICAgICAgICAgICAgICAgICBAc291bmRSZWZlcmVuY2VzW25hbWVdLnB1c2gocmVmZXJlbmNlKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLm5hbWUgPSBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5vbkRlY29kZUZpbmlzaCA9IChzb3VyY2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UgPSBuZXcgR1MuQXVkaW9CdWZmZXJSZWZlcmVuY2Uoc291cmNlLCB2b2ljZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG11c2ljRWZmZWN0IHRoZW4gcmVmZXJlbmNlLm9uRW5kID0gPT4gQHJlc3VtZU11c2ljKDQwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLnZvaWNlID0gdm9pY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS52b2x1bWUgPSB2b2x1bWUgLyAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5wbGF5YmFja1JhdGUgPSByYXRlIC8gMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UubG9vcCA9IGxvb3BTb3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgQHZvaWNlID0gcmVmZXJlbmNlIGlmIHZvaWNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2UucGxheSgpXG4gICAgICAgICAgICAgICAgICAgICAgICBAc291bmRSZWZlcmVuY2VzW3NvdXJjZS5uYW1lXS5wdXNoKHJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLmRlY29kZSgpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVmZXJlbmNlICAgICAgICAgICAgXG4gICAgXG4gICAgIyMjKlxuICAgICogUGxheXMgYSBtdXNpYyBhcyBhIHJhbmRvbSBtdXNpYy4gQSByYW5kb20gbXVzaWMgd2lsbCBmYWRlLWluIGFuZCBmYWRlLW91dFxuICAgICogYXQgcmFuZG9tIHRpbWVzLiBUaGF0IGNhbiBiZSBjb21iaW5lZCB3aXRoIG90aGVyIGF1ZGlvLWxheWVycyB0byBjcmVhdGUgYVxuICAgICogbXVjaCBiZXR0ZXIgbG9vcGluZyBvZiBhbiBhdWRpbyB0cmFjay5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHBsYXlNdXNpY1JhbmRvbVxuICAgICogQHBhcmFtIHtPYmplY3R9IG11c2ljIC0gVGhlIG11c2ljIHRvIHBsYXkuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZmFkZVRpbWUgLSBUaGUgdGltZSBmb3IgYSBzaW5nbGUgZmFkZS1pbi9vdXQgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGF1ZGlvIGxheWVyIHRvIHVzZS5cbiAgICAqIEBwYXJhbSB7Z3MuUmFuZ2V9IHBsYXlUaW1lIC0gUGxheS1UaW1lIHJhbmdlIGxpa2UgMTBzIHRvIDMwcy5cbiAgICAqIEBwYXJhbSB7Z3MuUmFuZ2V9IHBsYXlSYW5nZSAtIFBsYXktUmFuZ2UuXG4gICAgIyMjICAgICBcbiAgICBwbGF5TXVzaWNSYW5kb206IChtdXNpYywgZmFkZVRpbWUsIGxheWVyLCBwbGF5VGltZSwgcGxheVJhbmdlKSAtPlxuICAgICAgICByZXR1cm4gaWYgJFBBUkFNUy5wcmV2aWV3Py5zZXR0aW5ncy5tdXNpY0Rpc2FibGVkXG4gICAgICAgIGxheWVyID0gbGF5ZXIgPyAwXG5cbiAgICAgICAgdm9sdW1lID0gaWYgbXVzaWMudm9sdW1lPyB0aGVuIG11c2ljLnZvbHVtZSBlbHNlIDEwMFxuICAgICAgICB2b2x1bWUgPSB2b2x1bWUgKiAoQGdlbmVyYWxNdXNpY1ZvbHVtZSAvIDEwMClcbiAgICAgICAgQG11c2ljVm9sdW1lID0gdm9sdW1lXG4gICAgICAgIEBkaXNwb3NlTXVzaWMobGF5ZXIpXG4gICAgICAgIFxuICAgICAgICBpZiBtdXNpYy5uYW1lPyBhbmQgbXVzaWMubmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICBtdXNpY0J1ZmZlciA9IEBwbGF5KFwiQXVkaW8vTXVzaWMvI3ttdXNpYy5uYW1lfVwiLCB2b2x1bWUsIG11c2ljLnJhdGUpXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5sb29wID0geWVzXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci52b2x1bWUgPSAwXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5kdXJhdGlvbiA9IE1hdGgucm91bmQobXVzaWNCdWZmZXIuZHVyYXRpb24gKiAxMDAwIC8gMTYuNilcbiAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVR5cGUgPSAxXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5jdXN0b21EYXRhLnBsYXlUaW1lID0gcGxheVRpbWVcbiAgICAgICAgICAgIGlmIHBsYXlSYW5nZS5lbmQgPT0gMFxuICAgICAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlID0geyBzdGFydDogcGxheVJhbmdlLnN0YXJ0LCBlbmQ6IG11c2ljQnVmZmVyLmR1cmF0aW9uIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtdXNpY0J1ZmZlci5jdXN0b21EYXRhLnBsYXlSYW5nZSA9IHBsYXlSYW5nZVxuICAgICAgICAgICAgbXVzaWNCdWZmZXIuY3VzdG9tRGF0YS5mYWRlVGltZSA9IGZhZGVUaW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG11c2ljQnVmZmVyLmN1c3RvbURhdGEuc3RhcnRUaW1lciA9IE1hdGgucm91bmQobXVzaWNCdWZmZXIuY3VzdG9tRGF0YS5wbGF5UmFuZ2Uuc3RhcnQgKyBNYXRoLnJhbmRvbSgpICogKG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLmVuZCAtIG11c2ljQnVmZmVyLmN1c3RvbURhdGEucGxheVJhbmdlLnN0YXJ0KSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGF1ZGlvQnVmZmVycy5wdXNoKG11c2ljQnVmZmVyKSBpZiBub3QgQGF1ZGlvQnVmZmVycy5jb250YWlucyhtdXNpY0J1ZmZlcilcbiAgICAgICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSA9IG11c2ljQnVmZmVyXG4gICAgICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdID0gbmFtZTogbXVzaWMubmFtZSwgdGltZTogbXVzaWMuY3VycmVudFRpbWUsIHZvbHVtZTogbXVzaWMudm9sdW1lLCByYXRlOiBtdXNpYy5wbGF5YmFja1JhdGUsIGZhZGVJblRpbWU6IGZhZGVUaW1lLCBjdXN0b21EYXRhOiBtdXNpY0J1ZmZlci5jdXN0b21EYXRhXG4gICAgIFxuICAgICMjIypcbiAgICAqIFBsYXlzIGEgbXVzaWMuXG4gICAgKlxuICAgICogQG1ldGhvZCBwbGF5TXVzaWNcbiAgICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gbmFtZSAtIFRoZSBtdXNpYyB0byBwbGF5LiBDYW4gYmUganVzdCBhIG5hbWUgb3IgYSBtdXNpYyBkYXRhLW9iamVjdC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2b2x1bWUgLSBUaGUgbXVzaWMncyB2b2x1bWUgaW4gcGVyY2VudC5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByYXRlIC0gVGhlIG11c2ljJ3MgcGxheWJhY2sgcmF0ZSBpbiBwZXJjZW50LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVJblRpbWUgLSBUaGUgZmFkZS1pbiB0aW1lLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGxheWVyIHRvIHBsYXkgdGhlIG11c2ljIG9uLlxuICAgICogQHBhcmFtIHtib29sZWFufSBsb29wIC0gSW5kaWNhdGVzIGlmIHRoZSBtdXNpYyBzaG91bGQgYmUgbG9vcGVkXG4gICAgIyMjICAgICAgICAgIFxuICAgIHBsYXlNdXNpYzogKG5hbWUsIHZvbHVtZSwgcmF0ZSwgZmFkZUluVGltZSwgbGF5ZXIsIGxvb3BNdXNpYykgLT5cbiAgICAgICAgcmV0dXJuIGlmICRQQVJBTVMucHJldmlldz8uc2V0dGluZ3MubXVzaWNEaXNhYmxlZFxuICAgICAgICBsb29wTXVzaWMgPz0geWVzXG4gICAgICAgIGlmIG5hbWU/IGFuZCBuYW1lLm5hbWU/XG4gICAgICAgICAgICBsYXllciA9IGlmIGxheWVyPyB0aGVuIGxheWVyIGVsc2UgcmF0ZSB8fCAwXG4gICAgICAgICAgICBmYWRlSW5UaW1lID0gdm9sdW1lXG4gICAgICAgICAgICB2b2x1bWUgPSBuYW1lLnZvbHVtZVxuICAgICAgICAgICAgcmF0ZSA9IG5hbWUucGxheWJhY2tSYXRlXG4gICAgICAgICAgICBuYW1lID0gbmFtZS5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxheWVyID0gbGF5ZXIgPyAwXG4gICAgICAgICAgICBcbiAgICAgICAgQGRpc3Bvc2VNdXNpYyhsYXllcilcbiAgICAgICAgQGF1ZGlvTGF5ZXJzW2xheWVyXSA9IG5hbWU6IG5hbWUsIHZvbHVtZTogdm9sdW1lLCByYXRlOiByYXRlLCBmYWRlSW5UaW1lOiBmYWRlSW5UaW1lLCBwbGF5aW5nOiB0cnVlXG4gICAgICAgICAgIFxuICAgICAgICB2b2x1bWUgPSBpZiB2b2x1bWU/IHRoZW4gdm9sdW1lIGVsc2UgMTAwXG4gICAgICAgIHZvbHVtZSA9IHZvbHVtZSAqIChAZ2VuZXJhbE11c2ljVm9sdW1lIC8gMTAwKVxuICAgICAgICBAbXVzaWNWb2x1bWUgPSB2b2x1bWVcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBuYW1lPyBhbmQgbmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICBAbXVzaWMgPSBuYW1lOiBuYW1lXG4gICAgICAgICAgICBtdXNpY0J1ZmZlciA9IEBwbGF5KFwiQXVkaW8vTXVzaWMvI3tuYW1lfVwiLCB2b2x1bWUsIHJhdGUsIGZhZGVJblRpbWUpXG4gICAgICAgICAgICBtdXNpY0J1ZmZlci5sb29wID0gbG9vcE11c2ljXG4gICAgICAgICAgICBAYXVkaW9CdWZmZXJzLnB1c2gobXVzaWNCdWZmZXIpIGlmIG5vdCBAYXVkaW9CdWZmZXJzLmNvbnRhaW5zKG11c2ljQnVmZmVyKVxuICAgICAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdID0gbXVzaWNCdWZmZXJcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gbXVzaWNCdWZmZXJcbiAgICAgICAgICAgIFxuICAgICMjIypcbiAgICAqIFJlc3VtZXMgYSBwYXVzZWQgbXVzaWMuXG4gICAgKlxuICAgICogQG1ldGhvZCByZXN1bWVNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVJblRpbWUgLSBUaGUgZmFkZS1pbiB0aW1lIGluIGZyYW1lcy5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBsYXllciAtIFRoZSBhdWRpbyBsYXllciB0byByZXN1bWUuXG4gICAgIyMjICAgXG4gICAgcmVzdW1lTXVzaWM6IChmYWRlSW5UaW1lLCBsYXllcikgLT5cbiAgICAgICAgbGF5ZXIgPSBsYXllciA/IDBcbiAgICAgICAgaWYgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdPyBhbmQgbm90IEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXS5pc1BsYXlpbmdcbiAgICAgICAgICAgIEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXS5yZXN1bWUoZmFkZUluVGltZSlcbiAgICAgICAgICAgIEBhdWRpb0xheWVyc1tsYXllcl0/LnBsYXlpbmcgPSB0cnVlXG4gICAgXG4gICAgIyMjKlxuICAgICogU3RvcHMgYSBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIHN0b3BNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGZhZGVPdXRUaW1lIC0gVGhlIGZhZGUtb3V0IHRpbWUgaW4gZnJhbWVzLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGF1ZGlvIGxheWVyIHRvIHN0b3AuXG4gICAgIyMjICAgICAgICAgXG4gICAgc3RvcE11c2ljOiAoZmFkZU91dFRpbWUsIGxheWVyKSAtPiBcbiAgICAgICAgbGF5ZXIgPSBsYXllciA/IDBcbiAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdPy5zdG9wKGZhZGVPdXRUaW1lKVxuICAgICAgICBAYXVkaW9CdWZmZXJzQnlMYXllcltsYXllcl0/LmN1c3RvbURhdGEgPSB7fVxuICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdPy5wbGF5aW5nID0gZmFsc2VcbiAgICAgICAgQG11c2ljID0gbnVsbFxuICAgICAgICBcbiAgICAjIyMqXG4gICAgKiBTdG9wcyBhbGwgbXVzaWMvYXVkaW8gbGF5ZXJzLlxuICAgICpcbiAgICAqIEBtZXRob2Qgc3RvcEFsbE11c2ljXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZmFkZU91dFRpbWUgLSBUaGUgZmFkZS1vdXQgdGltZSBpbiBmcmFtZXMuXG4gICAgIyMjICAgICAgICAgXG4gICAgc3RvcEFsbE11c2ljOiAoZmFkZU91dFRpbWUpIC0+IFxuICAgICAgICBmb3IgYnVmZmVyIGluIEBhdWRpb0J1ZmZlcnNcbiAgICAgICAgICAgIGlmIGJ1ZmZlcj9cbiAgICAgICAgICAgICAgICBidWZmZXIuc3RvcChmYWRlT3V0VGltZSlcbiAgICAgICAgICAgICAgICBidWZmZXIuY3VzdG9tRGF0YSA9IHt9XG4gICAgICAgIEBtdXNpYyA9IG51bGxcblxuXG4gICAgZGlzcG9zZTogKGNvbnRleHQpIC0+XG4gICAgICAgIGRhdGEgPSBjb250ZXh0LnJlc291cmNlcy5zZWxlY3QgKHIpIC0+IHIuZGF0YVxuICAgICAgICBmb3IgYnVmZmVyLCBsYXllciBpbiBAYXVkaW9CdWZmZXJzQnlMYXllclxuICAgICAgICAgICAgaWYgYnVmZmVyIGFuZCBkYXRhLmluZGV4T2YoYnVmZmVyKSAhPSAtMVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAYXVkaW9CdWZmZXJzLnJlbW92ZShidWZmZXIpXG4gICAgICAgICAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdID0gbnVsbFxuICAgICAgICAgICAgICAgIEBhdWRpb0xheWVyc1tsYXllcl0gPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjKlxuICAgICogRGlzcG9zZXMgYSBtdXNpYy5cbiAgICAqXG4gICAgKiBAbWV0aG9kIGRpc3Bvc2VNdXNpY1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGxheWVyIC0gVGhlIGF1ZGlvIGxheWVyIG9mIHRoZSBtdXNpYyB0byBkaXNwb3NlLlxuICAgICMjIyBcbiAgICBkaXNwb3NlTXVzaWM6IChsYXllcikgLT5cbiAgICAgICAgbGF5ZXIgPSBsYXllciA/IDBcbiAgICAgICAgXG4gICAgICAgIEBzdG9wTXVzaWMoMCwgbGF5ZXIpXG4gICAgICAgICNAYXVkaW9CdWZmZXJzW2xheWVyXT8uZGlzcG9zZSgpXG4gICAgICAgIEBhdWRpb0J1ZmZlcnMucmVtb3ZlKEBhdWRpb0J1ZmZlcnNCeUxheWVyW2xheWVyXSlcbiAgICAgICAgQGF1ZGlvQnVmZmVyc0J5TGF5ZXJbbGF5ZXJdID0gbnVsbFxuICAgICAgICBAYXVkaW9MYXllcnNbbGF5ZXJdID0gbnVsbFxuICAgIFxud2luZG93LkF1ZGlvTWFuYWdlciA9IG5ldyBBdWRpb01hbmFnZXIoKVxuZ3MuQXVkaW9NYW5hZ2VyID0gQXVkaW9NYW5hZ2VyIl19
//# sourceURL=AudioManager_73.js