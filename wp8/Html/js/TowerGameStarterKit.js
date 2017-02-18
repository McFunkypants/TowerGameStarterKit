////////////////////////////////////////////////////////////////
// Tower Game Starter Kit for Windows 8
// Version 1.3 revision 77
// by Christer (@McFunkypants) Kaitila (http://mcfunkypants.com)
////////////////////////////////////////////////////////////////
// Source: https://github.com/mcfunkypants/TowerGameStarterKit
// Demo Game: http://www.mcfunkypants.com/Peasants/
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// The artwork in the example game is CC-BY (attribution)
// Please refer to the main menu credits button for details.
// If you reuse these assets, give credit - they deserve it!
////////////////////////////////////////////////////////////////
// Music composed by Zefz
// www.opengameart.com sprites by
// S.Challener C.Nilsson D.Eddeland D.Armstrong
// S.Colladay L.Zimmerman J.Charlot M.Riecke
// Isometric art by Reiner ‘Tiles’ Prokein
// Projectile particle sprites by Clint Bellanger
// Additional art, effects, sounds by Christer Kaitila

////////////////////////////////////////////////////////////////
// I gratefully acknowledge the following open source projects:
////////////////////////////////////////////////////////////////
// EASYSTAR.JS pathfinding engine by Bryce Neal (MIT license)
// - Source: https://github.com/prettymuchbryce/EasyStarJS
// - Demo: http://easystar.nodejitsu.com/demo.html
////////////////////////////////////////////////////////////////
// JAWSJS canvas engine by Ippa Lix (LGPL license)
// - Source: https://github.com/ippa/jaws
// - Demos and documentation: http://www.jawsjs.com
////////////////////////////////////////////////////////////////
// HOWLERJS sound engine by James Simpson (MIT license)
// - Source: (https://github.com/goldfire/howler.js)
// - Demos and documentation: http://www.howlerjs.com
////////////////////////////////////////////////////////////////
// TWEENJS engine by sole, mrdoob, et al (MIT license)
// - Source and demos: https://github.com/sole/tween.js
////////////////////////////////////////////////////////////////
// TILED map editor by Thorbjørn Lindeijer (GPL/BSD license)
// - Source: https://github.com/bjorn/tiled
// - Download: http://www.mapeditor.org
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// Informal summary of licenses: you can use/modify this file
// for any purpose, free or commercial, and do not have to
// make your project open source. Enjoy! Please give credit.
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// Notes on RAM use (only an issue on wp8 phones)
////////////////////////////////////////////////////////////////
// This game uses about 130MB of RAM - but there can be spikes when 
// you hit the home/power/search button and then resume.
// Just to be safe, we ensure that we will get at least 300MB of ram.
// see http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh855081(v=vs.105).aspx
// and http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh855083(v=vs.105).aspx
// and http://msdn.microsoft.com/en-us/library/windowsphone/develop/jj681682(v=vs.105).aspx
// If *your* game uses less ram, you can remove this from WMAppManifest.xml
// which will allow your game to run on phones with less ram than current models:
// <Requirements>
//      <Requirement Name="ID_REQ_MEMORY_300" />
// </Requirements>

/*
The MIT License

TowerGameStarterKit is Copyright (c) 2013 by Christer Kaitila - please credit www.mcfunkypants.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

////////////////////////////////////////////////////////////////
/**
 * Class constructor for the game itself.
 * Almost all properties and methods are private.
 */
function TowerGameStarterKit() {
////////////////////////////////////////////////////////////////

	// throw exceptions on sloppy code
	"use strict";

	///////////////////////////////////////////////
	// debug only - turn this off when you go live!
	///////////////////////////////////////////////
	var debugmode = 0; // 1 for debug info and profiler, >1 for DETAILED INFO
	///////////////////////////////////////////////

	///////////////////////////////////////////////
	// shortcuts from the global scope
	///////////////////////////////////////////////
	var tween = window.TWEEN; // handy for animation interpolation
	var jaws = window.jaws; // the jawsjs canvas api
	var Howl = window.Howl; // a cross-browser sound api
	var console = window.console; // the debug console
	if (!console) { // for old browsers, ignore
		console = {
			log : function () {}
		};
	}

	///////////////////////////////////////////////
	// private variables used for debug etc.
	///////////////////////////////////////////////
	var info_tag; // debug only: the FPS and performance stats DOM element
	var debugTouchInfo = FAR_AWAY; // what spritemap tile # did we last touch?
	var world_complexity = 0; // current # tiles that were found in the level data - used for debugging only
	var profile_starts = []; // for debug only: performance PROFILER
	var profile_length = []; // time how long things take to find performance bottlenecks
	var profile_maxlen = []; // this is only done if we are in debugmode

	///////////////////////////////////////////////
	// an array of filenames to preload
	///////////////////////////////////////////////
	var all_game_assets_go_here = "game-media/";
	var all_game_assets = [
		"titlescreen.png",
		"gui.png",
		"font.png",
		"level0.png",
		"level1.png",
		"level2.png",
		"level3.png",
		"level-select-screen.png",
		"titlebackground.png", // this is 1920x1080 and uses up about 4MB - if RAM is an issue, comment out this line and set use_parallax_background_titlescreen = false
		"cinematic.png",
		"particles.png",
		"msgbox.png",
		"entities.png",
		"buildmenu.png",
		"unit1.png",
		"unit2.png",
		"unit3.png",
		"unit4.png"
	];

	// the pre-rendered map terrain (level1.png etc)
	var terrainSprite = null;

	///////////////////////////////////////////////
	// current game player's stats
	///////////////////////////////////////////////
	var player_gold_startwith = 40;
	var player_Gold = player_gold_startwith;
	var player_nextGoldAt = 0; // timestamp when we get another gold
	var player_maxHealth = 15;
	var player_Health = 15;

	///////////////////////////////////////////////
	// particle system - see particles.png
	///////////////////////////////////////////////
	var particleARROW = 4;
	var particleFIRE = 5;
	var particleENERGY = 6;
	var particleBUILD = 7;
	var particleGOAL = 2;
	var particleSPAWN = 3;
	var particleARROWHIT = 8;
	var particleFIREHIT = 9;
	var particleENERGYHIT = 10;
	// spawn fireballs/arrows from window, not ground
	var tower_projectile_offsetY = -32;
	// we need to wait for projectiles to reach target before "exploding"
	var PROJECTILE_EXPLOSION_DELAY = 500;

	///////////////////////////////////////////////
	// sounds the game needs
	///////////////////////////////////////////////
	var sfx = new Howl({
			urls : ['game-media/sfx.mp3', 'game-media/sfx.ogg'],
			volume : 0.5,
			sprite : {
				// ms offset, ms length
				spawn : [0, 241],
				shootArrow : [300, 548],
				shootFire : [900, 879],
				hitEnergy : [1800, 1718],
				openBuildMenu : [3600, 440],
				Build : [4100, 1758],
				Goal : [5900, 1277],
				Victory : [7200, 1758],
				Defeat : [7200, 1758], // reuse Victory
				NotEnoughMoney : [9000, 560],
				menuclick : [3600, 440], // reuse openBuildMenu
				mapclick : [5900, 1277] // reuse Goal
			}
		});

	///////////////////////////////////////////////
	// Game data for enemy waves
	///////////////////////////////////////////////
	var ENTITY_MIN_RACE = 1;
	var ENTITY_MAX_RACE = 4;
	var wave_spawn_interval_ms = 1500; // time delay between enemies
	var wave_next_spawntime = 0; // timestamp
	var wave_current = 0; // which wave are we on?
	var wave_entitynum = 0; // which entity are we up to?
	var wave_none_left = false; // once all entities are dead AND this is true then we must have beat the level!
	var wave_max = 99; // for the "XX of YY" wave gui
	var wave = [
		// level 0 starts here
		[
			// each wave is a list of entities we need to spawn
			// a zero below is just an empty space (delay) between entity spawns
			[1, 0, 2, 0, 0, 0, 0],
			[2, 0, 1, 1, 1, 2, 1, 0, 0, 0, 0],
			[1, 0, 1, 1, 1, 2, 2, 2, 2]
		],
		// level 1 starts here
		[
			[3, 0, 3, 3, 0, 0, 0, 0],
			[1, 0, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0],
			[1, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 3, 3, 3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
			[3, 0, 3, 1, 0, 2, 3, 1, 3, 0, 1, 3, 2, 3, 0, 4, 3, 2, 1, 0, 1, 2, 3, 3, 1, 2, 1, 2, 1, 2, 1, 2, 1]
		],
		// level 2 starts here
		[
			[4, 0, 4, 4, 0, 0, 0, 0],
			[3, 0, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 0, 0, 0, 0],
			[1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0],
			[4, 0, 3, 1, 1, 2, 3, 1, 4, 1, 1, 3, 2, 4, 1, 4, 3, 2, 1, 1, 1, 2, 3, 4, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0],
			[3, 0, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3]
		],
		// level 3 starts here
		[
			[1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 0, 0, 0, 0],
			[3, 0, 3, 3, 3, 1, 2, 1, 2, 3, 3, 3, 3, 0, 0, 0, 0],
			[4, 0, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
			[1, 0, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 1, 1, 1, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4],
			[1, 0, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 1, 1, 1, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4],
			[1, 0, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 1, 1, 1, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4]
		]

	];

	///////////////////////////////////////////////
	// one instance of the Pathfinding() class, set up with current level
	///////////////////////////////////////////////
	var AI = null;
	var TEAM_BAD = 0;
	var TEAM_GOOD = 1;

	///////////////////////////////////////////////
	// Enemy AI uses levelX.js data for pathfinding
	///////////////////////////////////////////////
	var TILE_INDEX_WALKABLE = 1; // roads and other walkable paths
	var TILE_INDEX_BLOCKED = 2; // places enemies cannot walk
	var TILE_INDEX_SPAWN = 3; // where the enemies come from
	var TILE_INDEX_GOAL = 4; // where the enemies run to
	var TILE_INDEX_BUILDABLE = 5; // able to put a tower here
	var TILE_INDEX_BUILTUPON = 6; // towers
	// which tile numbers can entities walk on?
	var TILE_INDEX_WALKABLES = [TILE_INDEX_WALKABLE, TILE_INDEX_SPAWN, TILE_INDEX_GOAL, TILE_INDEX_BUILDABLE];

	///////////////////////////////////////////////
	// Gameplay settings
	///////////////////////////////////////////////
	var ms_per_gold = 1000; // how long between each new gold piece earned
	// costs for building units
	var buildCost = [15, 25, 32];
	// which unit has the play selected for building
	var selectedBuildingStyle = 0;

	///////////////////////////////////////////////
	// The build menu
	///////////////////////////////////////////////
	// the ring build menu overlay only appears over buildable land we click
	var buildMenuActive = false;
	// we click neighbor tiles to actually build when menu is open fixme todo use sprite collide?
	var FAR_AWAY = -999999;
	var buildChoice1tileX = FAR_AWAY;
	var buildChoice1tileY = FAR_AWAY;
	var buildChoice2tileX = FAR_AWAY;
	var buildChoice2tileY = FAR_AWAY;
	var buildChoice3tileX = FAR_AWAY;
	var buildChoice3tileY = FAR_AWAY;
	// where the next tower will be placed
	var buildPendingPixelX = FAR_AWAY;
	var buildPendingPixelY = FAR_AWAY;
	var buildPendingTileX = FAR_AWAY;
	var buildPendingTileY = FAR_AWAY;
	// the sprites used by the build menu:
	var buildMenuSprite = null;
	// the overlays that obscure items we can't afford
	var buildMenuOverlay1 = null;
	var buildMenuOverlay2 = null;
	var buildMenuOverlay3 = null;
	var buildMenuOverlayHeight = 50; //pixels
	// the glowing yellow outlines on clickable items
	var buttonHighlightImageON; // images
	var buttonHighlightImageOFF;
	var buttonHighlight = []; // sprites we can click

	///////////////////////////////////////////////
	// our walking units
	///////////////////////////////////////////////
	var entity_animation_framerate = 100; // ms per frame (8 frame walkcycle)
	var entityanimation = []; // [1..3] the sprite sheet for our four walking units, split into frames
	var includeDeadBodies = true; // if false, they simply dissappear when killed

	///////////////////////////////////////////////
	// the intro NPC dialogue cinematic
	///////////////////////////////////////////////
	var introCinematicSprites = [];
	var currentIntroCinematicSprite = null;
	var use_introCinematicBG = false;
	var introCinematicBG = null;
	var introSceneNumber = 0;
	var soundIntroHasBeenPlayed = false;
	var soundIntro1 = null;
	var introCinematicSceneLengthMS = [2500, 5000];

	/**
	 * Class constructor for the game itself, including player stats
	 */
	/*
	function GamePlayer() {
	this.self = this;
	this.name = '';
	this.score = 0;
	this.frame = 0;
	this.startTime = 0;
	this.money = 0; // how much gold we currently have
	this.moneyRate = 1; // how much gold we earn each sim
	this.entities = []; // a SpriteList containing active (alive) entities
	this.towers = []; // a SpriteList containing all the user's defenses
	this.bullets = []; // a SpriteList containing active bullets
	this.bases = []; // a SpriteList containing usually just one "base"
	this.waves = []; // a string containing pending badguy spawns
	this.spells = []; // an array of clickable area-of-effect special moves
	}
	 */
	/**
	 * Entity types for AI: used for both towers and entities
	 * This just defines how they attack, if at all
	 */
	/*
	var EntityType = {
	FODDER: 0,          // never attacks
	SOLDIER: 1,         // touch attack
	ARCHER: 2,          // distance attack
	MAGE: 3             // region attack
	};
	 */
	/**
	 * Class constructor for all game objects
	 * used by entities AND towers (who just don't move)
	 */
	/*
	function GameEntity(startx, starty) {
	if (debugmode) { log('Creating a new GameEntity'); }

	this.self = this; // just in case we lose the this. context (events)
	this.name = ''; // a string name we can react to
	this.team = 0; // 0 = the goodguys (player's team), 1+ = the badguys
	this.type = EntityType.FODDER; // an int expressing which type of entity it is
	this.sprite = null; // a jawsjs sprite entity with x,y and other props
	this.weapon = 0; // a WeaponEffect bit mask
	this.speed = 0; // how many pixels per sim frame to we move? (tower=0)
	this.health = 100; // how damaged are we? 0=dead
	this.shield = 1.0; // multiplier for damage (0.5 = 50% less damage)
	this.cost = 100; // how much gold it costs to buy this
	this.regeneration = 0; // how much health do we regain every sim frame
	this.destination = [0, 0]; // where we want to move to
	this.path = null; // a 2d array of coordinates [x,y]
	this.moveParticles = 0; // which particle system to trigger when we walk
	this.hurtParticles = 0; // sparks/smoke emitted when we get damaged
	this.dieParticles = 0; // explosion when we are destroyed
	this.birthday = 0; // a timestamp of when we were first spawned
	this.age = 0; // each sim step this gets bigger (ms)
	this.deathday = 0; // if not 0, when age > this it dies automatically

	var sprite_framesize = [128, 96]; // pixel dimensions of all entity sprites

	this.sprite = new jaws.Sprite({ x: startx, y: starty, anchor: "center_center", flipped: true });
	if (debugmode) { log("Chopping up player animation spritesheet..."); }
	this.sprite.animation = new jaws.Animation({ sprite_sheet: jaws.assets.get("player.png"), frame_size: sprite_framesize, frame_duration: 75 });
	this.sprite.move_anim = this.sprite.animation.slice(0, 7);
	this.sprite.setImage(this.sprite.animation.frames[0]);

	// stuff it into the SpriteList pool - needs to exist already via spawnEntities()
	entities.push(this.sprite);
	}
	 */

	/**
	 * Class constructor for all weapons held by entities
	 */
	// maps to particle animation number (5=arrows, 6=flame, 7=energy)
	var WEAPON_ARROWS = 1;
	var WEAPON_FIRE = 2;
	var WEAPON_ENERGY = 3;
	var DAMAGETYPE_PHYSICAL = 1;
	var DAMAGETYPE_MAGICAL = 2;
	var DAMAGETYPE_SLOW = 3;

	function GameWeapon(style) {
		this.self = this;
		this.damage = 25; // + or -: imagine healing towers?
		this.radius = 200; // attack range
		this.speed = 0; // + or -
		this.shootDelay = 3000; // time between shots
		this.shootDelayExtraVariance = 0;
		switch (style) {
		case WEAPON_FIRE:
			this.projectilenumber = particleFIRE;
			this.damage = 40; // three hits to kill
			this.damagetype = DAMAGETYPE_MAGICAL;
			this.particleHit = particleFIREHIT;
			this.soundEffectName = 'shootFire';
			break;
		case WEAPON_ENERGY:
			this.projectilenumber = particleENERGY;
			this.damage = 75; // two hits to kill
			this.damagetype = DAMAGETYPE_SLOW;
			this.particleHit = particleENERGYHIT;
			this.soundEffectName = 'hitEnergy';
			break;
		default: // case WEAPON_ARROWS:
			this.projectilenumber = particleARROW;
			this.damage = 25; // four hits to kill
			this.damagetype = DAMAGETYPE_PHYSICAL;
			this.particleHit = particleARROWHIT;
			this.soundEffectName = 'shootArrow';
			break;
		}

	}

	var game_objects; // a spritelist of dummy objects - just rendered sprites with no AI
	var guiButtonSprites; // a spritelist of sprites that you can click - each has a .action() callback - see guiClickMaybe()

	// sprites aplenty
	var entities; // a sprite list filled with entities
	var teams = []; // an array of spritelists, index is team number
	var healthbarsprites; // used and updated by entities
	var healthbarImage = []; // an array of images shared by all healthbar sprites
	var HEALTHBAROFFSET = -28; // pixels offset in Y from parent entity

	var towerImages = []; // three images used for building towers in spawnEntity()

	var BASE_ENTITY_SPEED = 0.5; // pixels per simulation step (1/60th sec) - in debug mode, move FAST for testing
	var entity_framesize = [32, 32]; // pixel dimensions of the entity sprite (if any)
	var num_entities = 0; // depends on the entities layer in the level data
	var sprite_sheet; // the level tile map's data sprite sheet image
	var use_level_sprite_sheet = false; // optimizaed out: we preredner the entire map as a png now

	// the backgrounds
	var use_parallax_background = false; // draw the looped bg
	var use_parallax_background_titlescreen = true; // draw the looped bg - works great on web, win8, and NEW wp8 phones, but this uses about 4MB RAM - see titlebackground.png
	var parallax; // the scrolling background during gameplay
	var titlebackground; // the background during titlescreen and transitions
	var background_colour = "#156c99"; // blue

	// simple spritesheet-based particle system
	var particles_enabled = true;
	var particles; // a SpriteList containing all of them
	var allparticleframes; // contains every sprite in the particle spritesheet
	var particle_framesize = [64, 64]; // pixel dimensions of each particle anim
	var particle_spritesheet_framecount = 32; // spritesheet frames per anim
	var PARTICLE_FRAME_MS = 30; // 15 = 60fps - looks fine much slower too
	var ENTITY_PARTICLE_OFFSETY = (-1 * (entity_framesize[0] / 2)) | 0; // explosions at torso, not feet

	// timer
	var game_paused = 3; // 0=playing 1=paused 3=mainmenu
	var allow_pausing = false; // this is a non-keyboard game
	var game_timer; // set by SetInterval for the stopwatchfunc
	var game_over = true; // are we currently playing?
	var framecount = 0;
	var lastframetime = 0;
	var currentFrameTimestamp = 0;
	var oneupdatetime = 1000 / 60; // how many milliseconds per simulation update
	var unsimulatedms = 0; // used for framerate independence
	var currentframems = 0; // so that movement is the same at any FPS
	var simstepsrequired = 0; // how many simulation steps were required this frame?
	var fps_prev_timestamp = 0;
	var fps_prev_framecount = 0;
	var fps_framecount = 0;
	var stopwatchstart = 0;

	// levels
	var level = []; // an array of jason level data objects
	var starting_level_number = 0; // should be zero except when testing
	var current_level_number = starting_level_number; // which one are we playing?
	var pendingLevelComplete = false; // do we need to change levels next frame?
	var TILESIZE = 64; // skelevator 32; // pixel dimensions of the level spritesheet tiles
	var TILESIZEDIV2 = (TILESIZE / 2) | 0; // |0 just forces integer type

	// viewport
	var viewport; // the visible game world that scrolls around
	var viewport_max_x = 10000; // these defaults are overwritten...
	var viewport_max_y = 1000; // ...depending on map data

	// transitions between levels
	var transitionEndtime;
	var transition_mode;
	var TRANSITION_LEVEL_COMPLETE = 0;
	var TRANSITION_GAME_OVER = 1;
	var TRANSITION_LENGTH_MS = 5000; // five seconds

	// gameplay settings - ALL UNUSED FIXME TODO?
	var gameover_when_time_runs_out = false; // default: play forever // unused
	var time_remaining = 0; // default: take your time and count up
	var time_direction = 1; // default: count up and never die based on time
	var startx = 292; // changed by the level data
	var starty = 420;

	// gui
	var need_to_draw_paused_sprite = false; // if we pause, render one more frame with PAUSED drawn on it
	var msgboxSprite; // used for background of "paused" and after levels / gameover screen
	var creditsSprite; // on overlay image with all the credits / about screen
	var fontSpriteSheet; // the numbers 0..9
	var guiSpriteSheet; // GUI overlays like the credits screen
	var splashSprite; // the splash screen graphic used during the TitleScreenState game state
	var levelSelectSprite; // the map parchment level select dialog
	var menuSprite; // the un-wobbly menu menu sprite overlay
	var levelcompleteSprite; // the words "level complete"
	var gameoverSprite; // the words "game over"
	var youloseSprite; // the words telling you WHY you failed
	var beatTheGameSprite; // the game over desciption for beating the game
	var menu_item_selected = 0; // 0=PLAY 1=CREDITS
	var titleframecount = 0; // used for simple menu particle animation
	var splashSpriteZoom = 0; // used only inside the TitleScreenState.update to zoom the logo in
	var showing_credits = false; // used in TitleScreenState
	var showing_levelselectscreen = false; // used in TitleScreenState
	var noKeysPressedLastFrame = true; // only react to new keydowns
	var CREDITS_BUTTON_X = 400; // default: gets changed in liquidLayoutGUI
	var gui_enabled = true; // score/time/count - if false no GUI at all
	var PausedGUI; // a sprite with the word "paused"

	// HUD (heads-up-display) of changing stats: Wave, Health and Gold
	var WaveGUI; // displays game time on the top left
	var WaveGUIlabel; // "Wave:"
	var wave_gui_x = 16;
	var wave_gui_y = 16;
	var wave_gui_spacing = 32; //12; // larger to make room for the " of "
	var wave_gui_digits = 2; // 9 of 9 is the max
	var wave_gui_digits_offset = 127;

	var GoldGUI; // displays player_Gold in the top middle
	var GoldGUIlabel; // "Gold:"
	var displayedGold = 0; // we animate the score GUI just for fun
	var gold_gui_x = 16;
	var gold_gui_y = wave_gui_y + 32 + 8;
	var gold_gui_spacing = 12;
	var gold_gui_digits = 3;
	var gold_gui_digits_offset = 150;

	var HealthGUI; // displays number of pickups left on the top right
	var HealthGUIlabel; // "Health:"
	var health_gui_x = 16;
	var health_gui_y = gold_gui_y + 32 + 8;
	var health_gui_spacing = 12;
	var health_gui_digits = 2;
	var health_gui_digits_offset = 160;

	// sound
	var mute = false; // no sound at all if true
	var soundMusic = null; // the background music loop

	////////////////////////////////////////////////////////////////
	// TowerGameStarterKit Functions Begin Here
	////////////////////////////////////////////////////////////////

	/**
	 * Debug console output.
	 * Used only when debugmode > 0.
	 */
	function log(str) {
		if (!debugmode) {
			return;
		}
		console.log(str);
	}

	/**
	 * Called when the user selects a level from the main menu
	 * Switches game state to PlayState
	 */
	function startGameNow() {
		if (debugmode) {
			log('START GAME NOW!');
		}
		showing_levelselectscreen = false;
		game_paused = false; // keyboard doesn't reset this
		//sfxstart();
		current_level_number = starting_level_number; // start from the first level (or whichever the user selected)
		clearParticles();
		jaws.switchGameState(PlayState); // Start game!
	}

	/**
	 * Click/touch event that fires when the user selects a level from the menu
	 */
	function levelSelectClick(px, py) {
		if (debugmode)
			log('levelSelectClick' + px + ',' + py);

		sfx.play('mapclick'); // wp8

		// the map is split into quadrants - which island did we click?
		// fixmto todo: use guisprites for each new level we add, scattered on the map
		if ((px < jaws.width / 2) && (py < jaws.height / 2)) {
			if (debugmode)
				log('Selected LEVEL 0');
			starting_level_number = 0;
		} else if ((px >= jaws.width / 2) && (py < jaws.height / 2)) {
			if (debugmode)
				log('Selected LEVEL 1');
			starting_level_number = 1;
		} else if ((px < jaws.width / 2) && (py >= jaws.height / 2)) {
			if (debugmode)
				log('Selected LEVEL 2');
			starting_level_number = 2;
		} else if ((px >= jaws.width / 2) && (py >= jaws.height / 2)) {
			if (debugmode)
				log('Selected LEVEL 3');
			starting_level_number = 3;
		}

		// fixme todo: the level init can take > 1 second!
		// we need feedback immediately after a click
		// IDEA: render again with a new image

		///////////////
		startGameNow();
		///////////////

	}

	////////////////////////////////////////////////////////////////
	// GAME STATE: THE TITLE SCREEN
	////////////////////////////////////////////////////////////////
	/**
	 * A jaws state object for a simplistic title screen.
	 * Note that many inits are performed for sprites that are used
	 * by the other states; if you remove the titlescreen,
	 * be sure to create these sprites elsewhere.
	 */
	function TitleScreenState() {

		/**
		 * init function for the titlescreen state
		 * also used to create sprites on first run
		 */
		this.setup = function () {

			if (debugmode)
				log('TitleScreenState.setup');

			// special message that tells C# whether or not to send back button events to js or handle natively
			console.log('[STOP-SENDING-BACK-BUTTON-EVENTS]');

			// wp8: try to reclaim some RAM that was used during inits/asset downloading
			if (typeof(window.CollectGarbage) == "function") {
				window.CollectGarbage();
				if (debugmode)
					log('TitleScreenState.setup just did a CollectGarbage()');
			}

			// used only for the particle decorations
			titleframecount = 0;

			// if the game is running in a web page, we may want the loading screen to be invisible
			// CSS display:none, and the game will only appear when ready to play: harmless if unhidden/app.
			jaws.canvas.style.display = 'block';

			game_paused = 3; // special paused setting: MENU MODE
			soundIntroHasBeenPlayed = false; // so that next game we start, we hear it again

			// allow keyboard input and prevent browser from getting these events
			jaws.preventDefaultKeys(["w", "a", "s", "d", "p", "space", "z", "up", "down", "right", "left"]);

			// an html gui element (using the DOM!) with the FPS and debug profile stats
			info_tag = document.getElementById("info");

			// the main menu background
			if (!splashSprite)
				splashSprite = new jaws.Sprite({
						image : "titlescreen.png",
						x : (jaws.width / 2) | 0,
						y : (jaws.height / 2) | 0,
						anchor : "center_center"
					});

			// the level select screen - the second phase of our title screen main menu
			if (!levelSelectSprite)
				levelSelectSprite = new jaws.Sprite({
						image : "level-select-screen.png",
						x : (jaws.width / 2) | 0,
						y : (jaws.height / 2) | 0,
						anchor : "center_center"
					});
			// so we can trap clicks on the map sprite
			levelSelectSprite.action = levelSelectClick;

			// reset in between play sessions - a list of clickable buttons
			guiButtonSprites = new jaws.SpriteList(); /// see guiClickMaybe()
			guiButtonSprites.push(levelSelectSprite);

			// the msgbox background - used for pause screen, gameover, level transitions
			if (!msgboxSprite)
				msgboxSprite = new jaws.Sprite({
						image : "msgbox.png",
						x : (jaws.width / 2) | 0,
						y : (jaws.height / 2) | 0,
						anchor : "center_center"
					});

			// the numbers 0..9 in 32x32 spritesheet fontmap
			// then we can use fontSpriteSheet.frames[num]
			if (debugmode)
				log("Chopping up font spritesheet...");
			if (!fontSpriteSheet)
				fontSpriteSheet = new jaws.SpriteSheet({
						image : "font.png",
						frame_size : [32, 32],
						orientation : 'down'
					});

			// the gui image has all sorts of labels, the credits screen, etc.
			if (!guiSpriteSheet)
				guiSpriteSheet = new jaws.Sprite({
						image : "gui.png"
					});

			// the credits screen
			if (!creditsSprite)
				creditsSprite = extractSprite(guiSpriteSheet.image, 0, 32 * 17, 352, 224, {
						x : (jaws.width / 2) | 0,
						y : ((jaws.height / 2) | 0) - 8,
						anchor : "center_center"
					});

			// particle system - one explosion per sprite
			if (particles_enabled) {
				if (!particles)
					particles = new jaws.SpriteList();
				// every frame of every particle animation
				if (!allparticleframes) {
					if (debugmode)
						log("Chopping up particle animation spritesheet...");
					allparticleframes = new jaws.Animation({
							sprite_sheet : jaws.assets.get("particles.png"),
							frame_size : particle_framesize,
							frame_duration : PARTICLE_FRAME_MS,
							orientation : 'right'
						});
				}
			}

			displayedGold = 0; // we increment displayed score by 1 each frame until it shows true player_Gold

			// the HUD gui sprites: score, etc.
			if (gui_enabled) {

				var n = 0; // temp loop counter

				if (!WaveGUIlabel)
					WaveGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 14, 256, 32, {
							x : wave_gui_x,
							y : wave_gui_y,
							anchor : "top_left"
						});
				if (!GoldGUIlabel)
					GoldGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 16, 256, 32, {
							x : gold_gui_x,
							y : gold_gui_y,
							anchor : "top_left"
						});
				if (!HealthGUIlabel)
					HealthGUIlabel = extractSprite(guiSpriteSheet.image, 0, 32 * 15, 256, 32, {
							x : health_gui_x,
							y : health_gui_y,
							anchor : "top_left"
						});
				if (!PausedGUI)
					PausedGUI = extractSprite(guiSpriteSheet.image, 0, 32 * 13, 352, 32, {
							x : (jaws.width / 2) | 0,
							y : (jaws.height / 2) | 0,
							anchor : "center_center"
						});

				if (!WaveGUI) {
					if (debugmode)
						log('creating wave gui');
					WaveGUI = new jaws.SpriteList();
					// the label
					WaveGUI.push(WaveGUIlabel);
					// eg 00000 from right to left
					for (n = 0; n < wave_gui_digits; n++) {
						WaveGUI.push(new jaws.Sprite({
								x : wave_gui_x + wave_gui_digits_offset + (wave_gui_spacing * wave_gui_digits) - (wave_gui_spacing * n),
								y : wave_gui_y,
								image : fontSpriteSheet.frames[0],
								anchor : "top_left"
							}));
					}
				}

				// these are sprite lists containing 0..9 digit tiles, ordered from right to left (1s, 10s, 100s, etc)
				if (!GoldGUI) {
					if (debugmode)
						log('creating gold gui');
					GoldGUI = new jaws.SpriteList();
					// the label
					GoldGUI.push(GoldGUIlabel);
					// eg 00000 from right to left
					for (n = 0; n < gold_gui_digits; n++) {
						GoldGUI.push(new jaws.Sprite({
								x : gold_gui_x + gold_gui_digits_offset + (gold_gui_spacing * gold_gui_digits) - (gold_gui_spacing * n),
								y : gold_gui_y,
								image : fontSpriteSheet.frames[0],
								anchor : "top_left"
							}));
					}
				}

				if (!HealthGUI) {
					if (debugmode)
						log('creating health gui');
					HealthGUI = new jaws.SpriteList();
					// the label
					HealthGUI.push(HealthGUIlabel);
					// eg 00000 from right to left
					for (n = 0; n < health_gui_digits; n++) {
						HealthGUI.push(new jaws.Sprite({
								x : health_gui_x + health_gui_digits_offset + (health_gui_spacing * health_gui_digits) - (health_gui_spacing * n),
								y : health_gui_y,
								image : fontSpriteSheet.frames[0],
								anchor : "top_left"
							}));
					}
				}
			} // if (gui_enabled)

			// create all the sprites used by the GUI
			if (!menuSprite)
				menuSprite = new jaws.Sprite({
						image : chopImage(guiSpriteSheet.image, 0, 32 * 10, 352, 32 * 2),
						x : (jaws.width / 2) | 0,
						y : (jaws.height / 2 + 40) | 0,
						anchor : "center_center",
						flipped : false
					});
			if (!levelcompleteSprite)
				levelcompleteSprite = new jaws.Sprite({
						image : chopImage(guiSpriteSheet.image, 0, 0, 352, 128),
						x : (jaws.width / 2) | 0,
						y : (jaws.height / 2) | 0,
						anchor : "center_center",
						flipped : false
					});
			if (!gameoverSprite)
				gameoverSprite = new jaws.Sprite({
						image : chopImage(guiSpriteSheet.image, 0, 128, 352, 64),
						x : (jaws.width / 2) | 0,
						y : ((jaws.height / 2) | 0) - 42,
						anchor : "center_center",
						flipped : false
					});
			if (!youloseSprite)
				youloseSprite = new jaws.Sprite({
						image : chopImage(guiSpriteSheet.image, 0, 192, 352, 64),
						x : (jaws.width / 2) | 0,
						y : ((jaws.height / 2) | 0) + 42,
						anchor : "center_center",
						flipped : false
					});
			if (!beatTheGameSprite)
				beatTheGameSprite = new jaws.Sprite({
						image : chopImage(guiSpriteSheet.image, 0, 256, 352, 64),
						x : (jaws.width / 2) | 0,
						y : ((jaws.height / 2) | 0) + 42,
						anchor : "center_center",
						flipped : false
					});

			// move all gui elements around in a window size independent way (responsive liquid layout)
			if (gui_enabled)
				liquidLayoutGUI();

			// trigger a menu press if we click anywhere: uses the pos to determine which menu item was clicked
			window.addEventListener("mousedown", unPause, false);

			// scrolling background images
			if (use_parallax_background_titlescreen) {
				if (!titlebackground) {
					titlebackground = new jaws.Parallax({
							repeat_x : true,
							repeat_y : true
						}); // skelevator: was repeat_y: false
					titlebackground.addLayer({
						image : "titlebackground.png",
						damping : 1
					});
					//titlebackground.addLayer({ image: "parallaxlayer2.png", damping: 8 });
				}
			}

		}; // title screen setup function

		/**
		 * update function (run every frame) for the titlescreen
		 */
		this.update = function () {

			// title screen zooms in - this could be a nice tween fixme todo
			splashSpriteZoom += 0.01;
			if (splashSpriteZoom > 1)
				splashSpriteZoom = 1;
			splashSprite.scaleTo(splashSpriteZoom);

			if (use_parallax_background_titlescreen) {
				// update parallax background scroll
				//titlebackground.camera_y -= 4; // skelevator: was _x += 4
			}

			// show which item we have currently selected - about 25 visible at any one time
			// only draws after the title screen is fully zoomed in
			if (titleframecount % 5 == 0 && splashSpriteZoom > 0.99) {
				if (menu_item_selected == 0)
					startParticleSystem(jaws.width / 2 - 16 - (Math.random() * 272), jaws.height / 2 + 32 + (Math.random() * 80));
				else
					startParticleSystem(jaws.width / 2 + 16 + (Math.random() * 272), jaws.height / 2 + 32 + (Math.random() * 80));
			}

			if (jaws.pressed("down") ||
				jaws.pressed("right")) {
				if (debugmode)
					log('credits button highlighted');
				titleframecount = 60; // reset particles immediately
				menu_item_selected = 1;
			}

			if (jaws.pressed("up") ||
				jaws.pressed("left")) {
				if (debugmode)
					log('start button highlighted');
				titleframecount = 60; // reset particles immediately
				menu_item_selected = 0;
			}

			// after gameover, debounce since you are holding down a key on prev frame
			if (noKeysPressedLastFrame) {
				if (jaws.pressed("enter") ||
					jaws.pressed("space") ||
					jaws.pressed("left_mouse_button") ||
					(!game_paused) // title screen done: onmousedown event only
				) {

					sfx.play('menuclick'); // wp8

					if (debugmode)
						log('Titlescreen click at ' + jaws.mouse_x + ',' + jaws.mouse_y + ' and CREDITS_BUTTON_X=' + CREDITS_BUTTON_X);

					// touch and mouse don't take keyboard menu_item_selected "highlight" into account
					// touch also never updates jaws.pressed("left_mouse_button")
					var justHidTheCredits = false;
					if (showing_credits) {
						if (debugmode)
							log('Titlescreen HIDING CREDITS.');
						showing_credits = false;
						menu_item_selected = 0;
						game_paused = 3; // reset
						justHidTheCredits = true;
						// special message that tells C# whether or not to send back button events to js or handle natively
						console.log('[STOP-SENDING-BACK-BUTTON-EVENTS]');
					} else // normal menu was clicked
					{
						if (jaws.mouse_x <= CREDITS_BUTTON_X) {
							if (debugmode)
								log('Titlescreen PLAY CLICKED!');
							menu_item_selected = 0;
						} else {
							if (debugmode)
								log('Titlescreen CREDITS CLICKED!');
							menu_item_selected = 1;
							// special message that tells C# whether or not to send back button events to js or handle natively
							console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');
						}
					}

					if (!justHidTheCredits) {
						if (menu_item_selected == 1) {
							if (debugmode)
								log('Titlescreen SHOWING CREDITS!');
							showing_credits = true;
							showing_levelselectscreen = false;
							game_paused = 3; // reset
							// special message that tells C# whether or not to send back button events to js or handle natively
							console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');
						} else // user wants to start the game!
						{
							if (debugmode)
								log('Titlescreen SHOWING MAP!');
							//Show the map and wait for levelSelectScreen's guiClickMaybe() to start the game
							showing_credits = false;
							showing_levelselectscreen = true;
							//startGameNow(); // is this redundant: called by levelSelectClick()
							// special message that tells C# whether or not to send back button events to js or handle natively
							console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');
						}
					}
				}
			}

			// ensure that we don't react to a press/key/click more than once
			if (!(jaws.pressed("enter")) && !(jaws.pressed("space")) && !(jaws.pressed("left_mouse_button")) && (game_paused == 3)) {
				// this "debounces" keypresses so you don't
				// trigger every single frame when holding down a key
				noKeysPressedLastFrame = true;
			} else {
				noKeysPressedLastFrame = false;
			}

			if (particles_enabled)
				updateParticles();

			titleframecount++;

		}; // title screen update function

		/**
		 * render function for the titlescreen
		 */
		this.draw = function () {

			if (use_parallax_background_titlescreen && titlebackground) {
				titlebackground.draw();
			} else { // no parallax: use colour
				jaws.context.fillStyle = background_colour;
				jaws.context.fillRect(0, 0, jaws.width, jaws.height);
			}

			if (need_to_draw_paused_sprite) {
				PausedGUI.draw();
			} else {

				if (showing_credits) {
					// just in case a previous level transition set the scale
					msgboxSprite.scaleTo(1);
					msgboxSprite.draw();
					creditsSprite.draw();
				} else if (showing_levelselectscreen) {
					levelSelectSprite.draw();
				} else {
					splashSprite.draw();
					if (particles_enabled)
						particles.draw();
					//menuSprite.draw();
				}
			}

		}; // title screen draw function

	} // title screen state

	////////////////////////////////////////////////////////////////
	// GAME STATE: LEVEL TRANSITIONS
	////////////////////////////////////////////////////////////////
	/**
	 * A jaws state object for the display in between levels (and game over) screen.
	 * Used to display messages like "game over" or "congratulations"
	 */
	function LevelTransitionScreenState() {

		this.setup = function () {

			if (debugmode)
				log('Game State: transition after level ' + current_level_number);

			// special message that tells C# whether or not to send back button events to js or handle natively
			console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');

			// wp8: try to reclaim some RAM that was used during inits/asset downloading
			if (typeof(window.CollectGarbage) == "function") {
				window.CollectGarbage();
				if (debugmode)
					log('LevelTransitionScreenState.setup just did a CollectGarbage()');
			}

			// clear the stopwatch timer if any
			if (game_timer)
				window.clearInterval(game_timer);

			transitionEndtime = new Date().valueOf() + TRANSITION_LENGTH_MS; // five seconds

			game_paused = true; // no clock updates

			if (transition_mode == TRANSITION_GAME_OVER) {
				//sfxdefeat();
				sfx.play('Defeat');
			}

			if (transition_mode == TRANSITION_LEVEL_COMPLETE) {
				current_level_number++; // upcoming level
				//sfxvictory()
				sfx.play('Victory');

			}

		}; // transition screen setup function

		// transition screen
		this.update = function () {

			// wobble just for fun
			// msgboxSprite.scaleTo(0.75 + (Math.sin(new Date().valueOf() * 0.001) / (Math.PI * 2)));

			if (particles_enabled)
				updateParticles();

			// fireworks!
			if (Math.random() > 0.92) {
				startParticleSystem(jaws.width / 4 + Math.random() * jaws.width / 2, jaws.height / 2 - 200 + (Math.random() * 400));
			}

			if (use_parallax_background) {
				// update parallax background scroll
				titlebackground.camera_x += 4;
			}

			if (transitionEndtime < (new Date().valueOf())) {

				if (debugmode)
					log('transition time is up');

				game_paused = false; // keyboard doesn't reset this

				if (transition_mode == TRANSITION_GAME_OVER) {
					if (debugmode)
						log('transitioning from game over to titlescreen');
					gameOver(false);
				} else {
					if (level[current_level_number]) {
						if (debugmode)
							log('about to play level ' + current_level_number);
						//sfxstart();
						jaws.switchGameState(PlayState); // begin the next level
					} else {
						if (debugmode)
							log('no more level data: the user BEAT the game!');
						gameOver(true);
					}
				}
			}

		}; // transition screen update function

		this.draw = function () {

			if (use_parallax_background)
				titlebackground.draw();
			msgboxSprite.draw();
			if (transition_mode == TRANSITION_GAME_OVER) {
				gameoverSprite.draw();
				youloseSprite.draw();
			} else {
				if (level[current_level_number]) // more to come?
				{
					//if (debugmode) log('Next world (level ' + current_level_number + ') exists...');
					levelcompleteSprite.draw();
				} else // game over: final level completed!
				{
					//if (debugmode) log('Next world (level ' + current_level_number + ') does not exist. GAME COMPLETED!');
					gameoverSprite.draw();
					beatTheGameSprite.draw();
				}
			}
			if (particles_enabled)
				particles.draw();

		}; // transition screen draw function

	} // level transition state

	////////////////////////////////////////////////////////////////
	// GAME STATE: PLAYING
	////////////////////////////////////////////////////////////////
	/**
	 * The in-game (during play) jaws state object.
	 * This is the workhorse that handles all gameplay.
	 */
	function PlayState() { // in-game state

		/**
		 * inits for the PlayState class: called once
		 */
		this.setup = function () {

			if (debugmode)
				log("PlayState.setup");

			// special message that tells C# whether or not to send back button events to js or handle natively
			console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');

			// wp8: try to reclaim some RAM that was used during inits/asset downloading
			if (typeof(window.CollectGarbage) == "function") {
				window.CollectGarbage();
				if (debugmode)
					log('PlayState.setup just did a CollectGarbage()');
			}

			profile_start("playstate setup");

			// reset all game states
			game_over = false;
			wave_current = 0;
			wave_none_left = false;
			wave_entitynum = 0;
			wave_next_spawntime = 0;
			pendingLevelComplete = false;
			buildPendingPixelX = FAR_AWAY;
			buildPendingPixelY = FAR_AWAY;
			buildPendingTileX = FAR_AWAY;
			buildPendingTileY = FAR_AWAY;
			player_Gold = player_gold_startwith;
			displayedGold = 0; // immediately count up
			buildMenuOFF();
			wave_next_spawntime = currentFrameTimestamp - 1; // NOW! don't wait for intro cinematic to finish: insta

			// no leftover particles
			clearParticles();

			// init the sprite sheet tiles
			if (use_level_sprite_sheet) {
				if (!sprite_sheet) {
					if (debugmode)
						log("Chopping up tiles spritesheet...");
					sprite_sheet = new jaws.SpriteSheet({
							image : "tiles.png",
							frame_size : [TILESIZE, TILESIZE],
							orientation : 'right'
						});
				}
			}

			// a generic sprite list for everything we need to draw first (like the terrainSprite)
			if (!game_objects)
				game_objects = new jaws.SpriteList();
			// game_objects persists beyond levels since it contains the buildMenuSprite

			// reset in between play sessions - a list of clickable buttons
			guiButtonSprites = new jaws.SpriteList(); /// see guiClickMaybe()

			// create new sprite lists (overwriting any left over from a previous game)
			entities = new jaws.SpriteList();
			teams[TEAM_BAD] = new jaws.SpriteList();
			teams[TEAM_GOOD] = new jaws.SpriteList();
			healthbarsprites = new jaws.SpriteList();

			initLevel(level[current_level_number]);
			if (gui_enabled)
				updateGUIsprites(WaveGUI, time_remaining); // change from 000 imediately

			// scrolling background images
			if (use_parallax_background) {
				if (!parallax) {
					parallax = new jaws.Parallax({
							repeat_x : true,
							repeat_y : true
						}); // skelevator was repeat_y: false
					parallax.addLayer({
						image : "parallax.png",
						damping : 4
					});
					//parallax.addLayer({ image: "parallaxlayer2.png", damping: 4 });
				}
			}

			// reset the player score if this is the first level
			// also, start the intro cinematic NPC dialogue
			if (current_level_number == starting_level_number) {
				player_Gold = player_gold_startwith;
				player_nextGoldAt = 0; // timestamp when we get another gold - fixme: wait a full second?
				introSceneNumber = 0;
				introCinematic(); // start the NPC dialogue
			}
			updateGUIsprites(GoldGUI, player_Gold); // immediate update to proper value in case it changed prev level

			player_maxHealth = 15;
			player_Health = 15;
			updateGUIsprites(HealthGUI, player_Health);

			// the respawn particle system!
			// if (particles_enabled) startParticleSystem(startx, starty, 5);

			// set up the chase camera view
			viewport = new jaws.Viewport({
					max_x : viewport_max_x,
					max_y : viewport_max_y
				});
			jaws.activeviewport = viewport; // resize events need this in global scope

			// start the timer! (fires once a second until game_over == true)
			stopwatchstart = 0;
			// clear any previous timers just in case
			if (game_timer)
				window.clearInterval(game_timer);
			game_timer = window.setInterval(stopwatchfunc, 1000);
			//game_timer = window.setTimeout(stopwatchfunc, 1000);

			profile_end("playstate setup");

			if (debugmode)
				log('PlayState.setup() completed.');

		}; // end setup function

		/**
		 * game simulation loop step - called every frame during play
		 */
		this.update = function () {

			profile_start('UPDATE SIMULATION');

			if (lastframetime == 0)
				lastframetime = new Date().valueOf();
			currentFrameTimestamp = new Date().valueOf();
			currentframems = (currentFrameTimestamp - lastframetime);

			// allow pausing
			if (allow_pausing) {
				if (jaws.pressed("p")) {
					// debounce: don't switch every single frame
					// while you hold down the key
					if (!this.pausetoggledelayuntil || (currentFrameTimestamp > this.pausetoggledelayuntil)) {
						this.pausetoggledelayuntil = currentFrameTimestamp + 1000;
						pauseGame(!game_paused);
					} else {
						if (debugmode)
							log('ignoring pause button until ' + this.pausetoggledelayuntil);
					}

				}
			}
			if (game_paused)
				return;

			// update the a-star Pathfinding class instance
			if (AI)
				AI.update();

			// update the tweener, moving entities
			if (tween)
				tween.update();

			// slowly earn gold IF we aren't in the intro cinematic
			if (player_nextGoldAt <= currentFrameTimestamp) {
				// removed, since the enemies start spawing right away now
				//if (introSceneNumber > 98) {
				player_nextGoldAt = currentFrameTimestamp + ms_per_gold;
				player_Gold++;
				updateGoldGUI();
				//}
				//else {
				//    if (debugmode>2) log('No gold earning during intro');
				//}
			}

			// Update the game simulation:
			// We calculate how much time in ms has elapsed since last frame
			// and run the physics/etc step functions 1 or more times.
			// Why? Since each step is a fixed step for 60fps
			// this ensures the game runs at the same speed
			// no matter what the performance and avoids
			// delta-based (time*speed) simulation steps that can
			// "poke through" walls if the fps is low
			unsimulatedms += currentframems;
			simstepsrequired = Math.floor(unsimulatedms / oneupdatetime);
			if (simstepsrequired > 10) {
				// max out just in case 1 fps; no "hanging"
				simstepsrequired = 10;
				unsimulatedms = 0;
			}
			lastframetime = currentFrameTimestamp;

			for (var sims = 0; sims < simstepsrequired; sims++) {

				unsimulatedms -= oneupdatetime;

				framecount++;

				// do we need to spawn another entity?
				if ((wave_next_spawntime !== 0) && wave_next_spawntime <= currentFrameTimestamp) {
					wave_next_spawntime = currentFrameTimestamp + wave_spawn_interval_ms;
					waveSpawnNextEntity();
				}

				// animate the entities
				if (entities) {
					entities.forEach(entityAI);
				}

				// useful for other types of games (such as ones with auto-scrolling):
				// ensure player never goes beyond the edge of the screen
				// this interferes with "falling off the edge" however
				// viewport.forceInside(sprite, 10);

				//viewport.centerAround(game_objects.at(0)); // fixme
				// should we follow the first known entity?

				// this works but we want tween to control it with moveCamera(px,py);
				/*
				if (entities) {
				var cameraFollows = entities.at(0);
				//viewport.centerAround(cameraFollows); // fixme broken if level is smaller than viewport
				viewport.x = Math.floor(cameraFollows.x - viewport.width / 2);
				viewport.y = Math.floor(cameraFollows.y - viewport.height / 2);
				}
				 */

				if (use_parallax_background) {
					// update parallax background scroll
					parallax.camera_x = viewport.x;
					// skelevator: line below was commented out:
					parallax.camera_y = viewport.y; // buggy? it works now... but the bg image only tiles horiz...
				}

				if (gui_enabled)
					updateGoldGUI(); // every frame!? optimize? OK?

				// update the buildMenu
				if (buildMenuOverlay1) {
					var fundingPercent;

					fundingPercent = player_Gold / buildCost[0];
					if (fundingPercent >= 1) {
						fundingPercent = 1;
						buttonHighlight[0].setImage(buttonHighlightImageON);
					} else {
						buttonHighlight[0].setImage(buttonHighlightImageOFF);
					}
					buildMenuOverlay1.setHeight(buildMenuOverlayHeight - (buildMenuOverlayHeight * fundingPercent));

					fundingPercent = player_Gold / buildCost[1];
					if (fundingPercent >= 1) {
						fundingPercent = 1;
						buttonHighlight[1].setImage(buttonHighlightImageON);
					} else {
						buttonHighlight[1].setImage(buttonHighlightImageOFF);
					}
					buildMenuOverlay2.setHeight(buildMenuOverlayHeight - (buildMenuOverlayHeight * fundingPercent));

					fundingPercent = player_Gold / buildCost[2];
					if (fundingPercent >= 1) {
						fundingPercent = 1;
						buttonHighlight[2].setImage(buttonHighlightImageON);
					} else {
						buttonHighlight[2].setImage(buttonHighlightImageOFF);
					}
					buildMenuOverlay3.setHeight(buildMenuOverlayHeight - (buildMenuOverlayHeight * fundingPercent));
				}

				if (particles_enabled)
					updateParticles();

			} // end sims loop for FPS independence

			// one or more collisions above may have set this to true
			if (pendingLevelComplete)
				levelComplete();

			profile_end('UPDATE SIMULATION');

		}; // end update function

		/**
		 * the primary game render loop - called every frame during play
		 */
		this.draw = function () {

			// when pausing, we need to render one frame first
			if (game_paused && !need_to_draw_paused_sprite) {
				return;
			}

			profile_start('DRAW EVERYTHING');

			if (use_parallax_background && parallax) {
				parallax.draw();
			} else {
				// we don't need to bother clearing the screen because the parallax fills entire bg
				jaws.context.fillStyle = background_colour;
				jaws.context.fillRect(0, 0, jaws.width, jaws.height);
			}

			viewport.apply(function () {

				game_objects.draw(); // all the non tilemap moving objects - just the terrain background and build menu for now!

				if (entities)
					entities.drawIf(viewport.isPartlyInside);
				if (healthbarsprites)
					healthbarsprites.drawIf(viewport.isPartlyInside);

				profile_start('particles');
				particles.drawIf(viewport.isPartlyInside);
				profile_end('particles');

			});

			if (gui_enabled)
				renderGUI();

			if (need_to_draw_paused_sprite) {
				need_to_draw_paused_sprite = false;
				PausedGUI.draw();
			}

			// intro cinematic
			if (introCinematicBG)
				introCinematicBG.draw();
			if (currentIntroCinematicSprite)
				currentIntroCinematicSprite.draw();

			profile_end('DRAW EVERYTHING');

		}; // PlayState.draw

	} // PlayState

	/**
	 * The pathfinding class constructor
	 */
	function Pathfinding() {
		if (debugmode)
			log('init Pathfinding');
		profile_start('init Pathfinding');

		this.astar = new window.EasyStar.js();
		this.astar.enableDiagonals();

		/*
		// default 10x10 world grid data for testing only
		// a simple circuit around the outside
		this._grid =
		[
		[0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
		[0, 1, 1, 1, 0, 0, 0, 1, 1, 0],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
		[0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
		[1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
		[1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
		[0, 0, 0, 1, 1, 1, 1, 0, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[0, 1, 0, 0, 0, 0, 1, 1, 1, 0],
		[0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
		];

		this.astar.setGrid(this._grid); //Tell EasyStar that this is the grid we want to use
		this.astar.setAcceptableTiles([0]); //Set acceptable tiles - an array of tile numbers we're allowed to walk on
		//this.astar.setIterationsPerCalculation(300); //Set iterations per calculation - some paths may take > 1 frame to calculate!
		//this.astar.setTileCost(1, 1.1); //Make it slightly preferable to take roads - tilenum, costmultiplier
		 */

		/**
		 * A simple utility function that splits a 1d array [1,2,3,4,5,6,7,8]
		 * into a 2d array of a defined column count [[1,2,3,4],[5,6,7,8]]
		 */
		this.listToMatrix = function (list, elementsPerSubArray) {
			var matrix = [],
			i,
			k,
			currentCol;

			for (i = 0, k = -1; i < list.length; i++) {
				if (i % elementsPerSubArray == 0) {
					k++;
					matrix[k] = [];
					currentCol = 0;
				}

				// detect start and end locations
				if (list[i] == TILE_INDEX_SPAWN) {
					this.spawnX = currentCol; // in pixels: * TILESIZE + TILESIZEDIV2;
					this.spawnY = k; // in pixels: * TILESIZE + TILESIZEDIV2;
					if (debugmode)
						log('Found the SPAWN at ' + this.spawnX + ',' + this.spawnY);
				}
				if (list[i] == TILE_INDEX_GOAL) {
					this.goalX = currentCol; // in pixels: * TILESIZE + TILESIZEDIV2;
					this.goalY = k; //in pixels: * TILESIZE + TILESIZEDIV2;
					if (debugmode)
						log('Found the GOAL at ' + this.goalX + ',' + this.goalY);
				}

				currentCol++;

				matrix[k].push(list[i]);
			}

			return matrix;
		};

		this.spawnX = 0;
		this.spawnY = 0;
		this.goalX = 1;
		this.goalY = 1;

		this.newGrid = function (lvldata, lvlw, lvlh) {
			if (debugmode)
				log('pathfinding.newGrid is ' + lvlw + 'x' + lvlh);

			this._grid = this.listToMatrix(lvldata, lvlw); // turn the 1d array into a 2d array
			this.astar.setGrid(this._grid); //Tell EasyStar that this is the grid we want to use
			this.astar.setAcceptableTiles(TILE_INDEX_WALKABLES); //Set acceptable tiles - an array of tile numbers we're allowed to walk on
			// wp8 need to JSON.stringify
			// if (debugmode) log(this._grid);
		};

		/*
		// test pathfinding!
		// the callback is inline so we know which AI it is for
		profile_start('test Pathfinding');
		var testAI = {};
		this.astar.findPath(0, 0, 9, 9,
		function (path) { pathFoundCallback(testAI, path); }
		);
		//Tell EasyStar to calculate a little, right now!
		this.astar.calculate();
		 */

		this.findPath = function (who, x1, y1, x2, y2) {
			if (debugmode > 1)
				log('Requesting a path from ' + x1 + ',' + y1 + ' to ' + x2 + ',' + y2);
			if (!this._grid) {
				if (debugmode)
					log('ERROR: Unable to findPath: newGrid has net yet been called!');
				pathFoundCallback(who, null);
				return;
			}
			who.waitingForPath = true;
			this.astar.findPath(x1, y1, x2, y2,
				function (path) {
				pathFoundCallback(who, path);
			});
		};

		/**
		 * Tell EasyStar to calculate a little, right now!
		 */
		this.update = function () {
			profile_start('Pathfinding.update');
			//if (debugmode>1) log('Pathfinding.update');
			this.astar.calculate();
			profile_end('Pathfinding.update');
		};

		profile_end('init Pathfinding');
	}

	function pathFoundCallback(who, path) {
		if (debugmode)
			log('pathFoundCallback');
		if (path == null) {
			if (debugmode)
				log('Unable to find path!');
		} else {
			if (debugmode)
				log('We found a path!');
			var pathstring = '';
			for (var pathloop = 0; pathloop < path.length; pathloop++) {
				pathstring += path[pathloop].x + ',' + path[pathloop].y + '|';
			}
			if (debugmode)
				log(pathstring);

			if (who) {
				who.currentPath = path;
				who.waitingForPath = false;
			}

		}
		//profile_end('test Pathfinding');
	}

	/**
	 * Records the current timestamp for a named event for benchmarking.
	 * Call profile_end using the same event name to store the elapsed time
	 * Only used when debugging to find areas of poor performance.
	 */
	function profile_start(name) {
		if (!debugmode)
			return;
		profile_starts[name] = new Date().valueOf();
	}

	/**
	 * Records the end timestamp for a named event for benchmarking.
	 * Call profile_start using the same event name to begin
	 */
	function profile_end(name) {
		if (!debugmode)
			return;
		profile_length[name] = new Date().valueOf() - profile_starts[name];
		if (!profile_maxlen[name] || (profile_maxlen[name] < profile_length[name]))
			profile_maxlen[name] = profile_length[name];
		//spammy if (debugmode) log(name + ' took ' + profile_length[name] + 'ms');
	}

	/**
	 * tick function for a game timer - called once per second
	 * this is often called the game's heartbeat clock
	 */
	function stopwatchfunc() { // fixme todo unused

		if (!game_paused) {
			time_remaining += time_direction;
			//if (gui_enabled) updateGUIsprites(WaveGUI, time_remaining);

			// spawn entities via the waves of enemies
			// this is now done using timestamps in the playstate update loop
			// wave_next_spawntime = currentFrameTimestamp + wave_spawn_interval_ms;
			// waveSpawnNextEntity();

		}

		if ((time_remaining < 1) && gameover_when_time_runs_out) {
			if (debugmode)
				log('RAN OUT OF TIME!');
			//sfxdie();
			transition_mode = TRANSITION_GAME_OVER;
			jaws.switchGameState(LevelTransitionScreenState);
			// will eventually call gameOver(false);
		}

		//window.setTimeout(stopwatchfunc, 1000);

	}

	/**
	 * draws the in-game HUD (head-up-display) GUI (score, etc.)
	 */
	function renderGUI() {

		if (!gui_enabled)
			return;

		profile_start('renderGUI');

		if (GoldGUI)
			GoldGUI.draw();
		if (WaveGUI)
			WaveGUI.draw();
		if (HealthGUI)
			HealthGUI.draw();

		// update FPS gui once a second max so it doesn't affect fps too much
		if (info_tag) {
			fps_framecount++;
			if (currentFrameTimestamp > (fps_prev_timestamp + 1000)) {
				fps_prev_timestamp = currentFrameTimestamp;
				fps_prev_framecount = fps_framecount;
				fps_framecount = 0;

				var profilestring = '';
				if (debugmode) {
					for (var pname in profile_length) {
						profilestring += '<br>' + pname + ':' + profile_length[pname] + 'ms (max:' + profile_maxlen[pname] + 'ms)';
					}
					profilestring += '<br>simstepsrequired: ' + simstepsrequired;
					profilestring += '<br>unsimulatedms: ' + unsimulatedms;
					profilestring += '<br>currentframems: ' + currentframems;
					profilestring += '<br>last touched sprite: ' + debugTouchInfo;
					info_tag.innerHTML = "FPS: " + fps_prev_framecount + profilestring +
						'<br>currentFrameTimestamp: ' + currentFrameTimestamp;
				}
			}
		}

		profile_end('renderGUI');

	} // renderGUI function

	/**
	 * spawns a spritesheet-based particle animation at these coordinates
	 * implements a reuse POOL and only makes new objects when required
	 */
	function startParticleSystem(x, y, particleType, destX, destY) {

		if (!particles_enabled)
			return;

		var p,
		pnum,
		pcount;
		if (!particleType)
			particleType = Math.floor(Math.random() * 1.99999); // random cycle between the first two
		for (pnum = 0, pcount = particles.length; pnum < pcount; pnum++) {
			p = particles.at(pnum);
			if (p && p.inactive) {
				break;
			}
		}

		// we need a new particle!
		if (!p || !p.inactive) {
			profile_start('new particle');
			if (debugmode > 1)
				log('All particles are in use. Allocating particle #' + pcount);
			var particle = new jaws.Sprite({
					x : FAR_AWAY,
					y : FAR_AWAY,
					anchor : "center_center"
				});
			particle.inactive = true; // don't draw or animate
			particle.anim = []; // several kinds of animation

			// each 32 frame row of the particles.png spritesheet is one effect
			// white puff
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 0, particle_spritesheet_framecount * 1 - 1));
			// gold star puff
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 1, particle_spritesheet_framecount * 2 - 1));
			// smoke: particleGOAL
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 2, particle_spritesheet_framecount * 3 - 1));
			// burst: particleSPAWN
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 3, particle_spritesheet_framecount * 4 - 1));

			// projectile particle systems are half as long
			// arrow
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 4, particle_spritesheet_framecount * 5 - 1 - (particle_spritesheet_framecount / 2)));
			// fire
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 5, particle_spritesheet_framecount * 6 - 1 - (particle_spritesheet_framecount / 2)));
			// energy
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 6, particle_spritesheet_framecount * 7 - 1 - (particle_spritesheet_framecount / 2)));

			// coins: particleBUILD
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 7, particle_spritesheet_framecount * 8 - 1));

			// arrow hit
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 8, particle_spritesheet_framecount * 9 - 1));
			// fire hit
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 9, particle_spritesheet_framecount * 10 - 1));
			// energy hit
			particle.anim.push(allparticleframes.slice(particle_spritesheet_framecount * 10, particle_spritesheet_framecount * 11 - 1));

			/*
			var pexplosion0 = allparticleframes.slice(0, particle_spritesheet_framecount - 1); // first row
			particle.anim.push(pexplosion0); // store a new kind of animation
			// another 32 frame animation)
			var pexplosion1 = allparticleframes.slice(particle_spritesheet_framecount, particle_spritesheet_framecount * 2 - 1); // second row
			particle.anim.push(pexplosion1);
			// 16 frame anims
			var pexplosion2 = allparticleframes.slice(32 + 32, 47 + 32);
			particle.anim.push(pexplosion2);
			var pexplosion3 = allparticleframes.slice(48 + 32, 63 + 32);
			particle.anim.push(pexplosion3);
			var pexplosion4 = allparticleframes.slice(64 + 32, 79 + 32);
			particle.anim.push(pexplosion4);
			var pexplosion5 = allparticleframes.slice(80 + 32, 95 + 32);
			particle.anim.push(pexplosion5);

			// projectile moving particles
			// arrow, fire, energy, coins
			var pexplosion6 = allparticleframes.slice(160, 191);
			particle.anim.push(pexplosion6);
			var pexplosion7 = allparticleframes.slice(192, 223);
			particle.anim.push(pexplosion7);
			var pexplosion8 = allparticleframes.slice(224, 255);
			particle.anim.push(pexplosion8);
			var pexplosion9 = allparticleframes.slice(256, 287);
			particle.anim.push(pexplosion8);
			 */

			// remember this new particle in our system and reuse
			particles.push(particle);
			p = particle;
			profile_end('new particle');
		}

		if (p && p.inactive) {
			p.x = x;
			p.y = y;
			p.inactive = false;
			p.animation = p.anim[particleType]; // use selected anim
			p.animation.index = 0; // start anim over again
			p.animation.last_tick = (new Date()).getTime();
			p.animation.sum_tick = 0;
			p.setImage(p.animation.next());

			// optionally moving particles
			if (destX && destY) {
				if (debugmode)
					log('Creating a moving particle going to ' + destX + ',' + destY);
				p.moving = true;
				p.destX = destX;
				p.destY = destY;
				lookAt(p, destX, destY);
				p.speedX = (destX - x) / particle_spritesheet_framecount;
				p.speedY = (destY - y) / particle_spritesheet_framecount;
			} else {
				p.moving = false;
			}

		}

	}

	function clearParticles() {
		if (debugmode)
			log('clearParticles');
		particles.forEach(function (p) {
			p.x = p.y = FAR_AWAY; // throw offscreen
			p.inactive = true;
		});
	}

	/**
	 * steps the particle effects simulation
	 */
	function updateParticles() {
		if (!particles_enabled)
			return;
		// animate the particles
		particles.forEach(
			function (p) {
			if (!p.inactive) {

				// moving particles
				if (p.moving) {
					p.x += p.speedX;
					p.y += p.speedY;
				}

				if (p.animation.atLastFrame()) {
					//if (debugmode) log('particle anim ended');
					p.x = p.y = FAR_AWAY; // throw offscreen
					p.inactive = true;
				} else {
					p.setImage(p.animation.next());
				}
			}
		});
	}

	/**
	 * Extracts a portion of an image to a new canvas
	 * Used for chopping up the GUI spritesheet
	 * because each item has a different size and thus
	 * the jaws.Spritesheet class is insufficient
	 */
	function chopImage(image, x, y, width, height) {
		if (!image)
			throw "chopImage with an undefined image";
		var cut = document.createElement("canvas");
		cut.width = width;
		cut.height = height;
		var ctx = cut.getContext("2d");
		ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height);
		return cut;
	}

	/**
	 * returns a jaws sprite with pixels extracted
	 * from a smaller section of the source image
	 */
	function extractSprite(fromthisimage, x, y, width, height, params) {
		params = params || {};
		var extracted = chopImage(fromthisimage, x, y, width, height);
		params.image = extracted;
		return new jaws.Sprite(params);
	}

	/**
	 * During play, this will pause/unpause the game.
	 * Called by either a resize event (snapped view, etc.)
	 * or the user (touch pause button, press [P]
	 */
	function pauseGame(pauseplease) {

		if (pauseplease) { // pause ON

			if (debugmode)
				log('[PAUSING]');

			// we might be in the main menu (game_paused==3)
			if (game_paused != 3)
				game_paused = true;

			// because main menu is already considered "paused"
			need_to_draw_paused_sprite = true;

		} else // paused OFF
		{
			if (debugmode)
				log('[UN-PAUSING]');

			need_to_draw_paused_sprite = false;

			if (game_paused != 3)
				game_paused = false;

		}

		if (debugmode)
			log('pause toggle: ' + game_paused);

		// when we start up again, we don't want
		// the time elapsed to be simulated suddenly
		lastframetime = new Date().valueOf();
		unsimulatedms = 0;
		currentframems = 0;

		if (pauseplease) {
		    if (window.Howler) window.Howler.mute(); // music/sound
		} else {
		    if (window.Howler) window.Howler.unmute(); // music/sound
		}

	}

	/**
	 * only used during the title screen menu
	 */
	// FIXME: this is called on ANY click anytime - spammy
	function unPause(e) {
		if (game_paused == 3) {
			game_paused = false;
			if (debugmode)
				log('Unpausing the titlescreen = start the game!');
		}
		// unmute the music?
		//Howler.unmute();
	}

	function lookAt(spr, x, y) {
		if (!spr || isNaN(x) || isNaN(y)) {
			if (debugmode)
				log("ERROR: Empty value passed to the lookAt function");
			return;
		}

		// angle in radians
		//var angle = Math.atan2(y - spr.y, x - spr.x);

		// angle in degrees
		var angle = Math.atan2(y - spr.y, x - spr.x) * 180 / Math.PI;

		spr.rotateTo(angle); // instant

		/*
		// smooth - BUGGY: turns the long way around then the 0deg-360deg barrier is crossed
		var flip = 1;
		var rotationSpeed = 5;
		if (debugmode) log('lookAt target=' + Math.round(angle) + ' current=' + Math.round(spr.angle));
		if (spr.angle > angle) spr.rotate(flip * -rotationSpeed);
		else if (spr.angle < angle) spr.rotate(flip * rotationSpeed);
		//if (spr.angle > 360) spr.angle -= 360;
		//if (spr.angle < 0) spr.angle += 360;
		 */

	}

	function attackCastle(nme) {
		if (debugmode)
			log('Attacking the castle!');
		sfx.play('Goal');
		player_Health--;
		updateGUIsprites(HealthGUI, player_Health);
		startParticleSystem(nme.x, nme.y, particleGOAL);
		nme.active = false;
		// destroy this entity and its healthbar and team affiliation etc
		removeEntity(nme);
		// fixme: maybe the door is an entity and we need to get its hp down?
		checkLevelComplete();
	}

	function closeEnough(x1, y1, x2, y2, dist) {
		return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) <= dist);
	}

	/**
	 * Very simplistic entity AI update function
	 * called every frame to move entities
	 */
	function entityAI(nme) {

		if (!nme.active) {
			//if (debugmode) log("entityAI ignoring inactive entity");
			return;
		}

		//if (debugmode) log("entityAI for an entity with speed " + nme.speed);

		// move the healthbar
		if (nme.healthbarsprite) {
			nme.healthbarsprite.moveTo(nme.x, nme.y + HEALTHBAROFFSET);
			//nme.healthbarsprite.setImage(healthbarImage[0]); // only change when damaged!
		}

		// entities can emit particles - nice for smoke trails
		if (nme.pendingParticles) {
			if (!nme.nextPartyTime)
			{
				nme.PartyDelay = 50;
				nme.PartyDelayExtraVariance = 0;
				nme.nextPartyTime = 1; // now!
			}
			if (nme.nextPartyTime <= currentFrameTimestamp) {
				nme.pendingParticles--;
				if (debugmode > 2)
					log('Entity time to Party');

				if (nme.pendingParticles > 0)
					nme.nextPartyTime = currentFrameTimestamp + nme.PartyDelay + (Math.random() * nme.PartyDelayExtraVariance);

				startParticleSystem(nme.x, nme.y + ENTITY_PARTICLE_OFFSETY, nme.pendingParticleType);

				if (nme.pendingDamage) {
					if (debugmode)
						log('entityAI has pending damage of ' + nme.pendingDamage);

					nme.health -= nme.pendingDamage;
					if (nme.healthbarsprite) {
						if (nme.health > 75)
							nme.healthbarsprite.setImage(healthbarImage[0]);
						else if (nme.health > 50)
							nme.healthbarsprite.setImage(healthbarImage[1]);
						else if (nme.health > 25)
							nme.healthbarsprite.setImage(healthbarImage[2]);
						else
							nme.healthbarsprite.setImage(healthbarImage[3]);
					}

					if (nme.health <= 0) {
						if (debugmode)
							log('Entity destroyed!');
						nme.active = false;
						nme.dead = true;
						nme.speed = 0;
						if (!includeDeadBodies) {
							removeEntity(nme);
						} else {
							// a little random death location
							nme.rotateTo(90 + (Math.random() * 10 - 5)); // lie down - simple!
							nme.x += Math.random() * 8 - 4;
							nme.y += Math.random() * 8 - 4;
							nme.alpha = 0.5; // slightly transparent
							// stop checking collisions
							teams[nme.team].remove(nme);
							// stop drawing its healthbar
							if (nme.healthbarsprite)
								healthbarsprites.remove(nme.healthbarsprite);
							// check if we completed the level (eg all badguys destroyed?) fixme todo: maybe just current ones: waves
							checkLevelComplete();
						} // if includeDeadBodies
					} //  if it died
				} // if pending damage
			} // time for the pending particle
		} // if pendingParticles

		// shoot at entities if possible
		if (nme.weapon && nme.enemySpriteList) {
			if (!nme.weapon.nextShootTime) // init shooting ai fixme constructor tons of stuff here
			{
				nme.weapon.nextShootTime = currentFrameTimestamp + (Math.random() * nme.weapon.shootDelay) + (Math.random() * nme.weapon.shootDelayExtraVariance);
			}

			for (var tryme = 0; tryme < nme.enemySpriteList.length; tryme++) {
				var nextone = nme.enemySpriteList.at(tryme);
				if ((nextone != nme) && (nextone.team != nme.team) && nextone.active) {
					// fixme maybe choose the CLOSEST viable target? or oldest?
					if (jaws.distanceBetween(nme, nextone) < nme.weapon.radius) {

						if (debugmode > 2)
							log('Able to shoot something!');

						// rotate to point at target even if not firing
						// only good for top down sprites (tank game turrets etc)
						// lookAt(nme, nextone.x, nextone.y);

						if (nme.weapon.nextShootTime < currentFrameTimestamp) {
							if (debugmode)
								log('Entity time to shoot');
							nme.weapon.nextShootTime = currentFrameTimestamp + nme.weapon.shootDelay + (Math.random() * nme.weapon.shootDelayExtraVariance);

							//sfx.play('shootFire');
							sfx.play(nme.weapon.soundEffectName); // poopoo

							// left or right side?
							var tower_projectile_offsetX = 16;
							if (nme.x > nextone.x)
								tower_projectile_offsetX *= -1;

							// projectile moving particles
							startParticleSystem(nme.x + tower_projectile_offsetX, nme.y + tower_projectile_offsetY, nme.weapon.projectilenumber, nextone.x, nextone.y);

							// we have perfect aim
							takeDamage(nextone, nme);

							break; // out of loop: only attack once
						} // time
					} // distance
				} // team
			} // loop
			//} // time
		} // if nme.weapon


		// do we need to move?
		if (nme.speed) {
			if (!nme.currentPath && !nme.waitingForPath) {
				if (debugmode)
					log('Generating new path for an entity');
				nme.pathCurrentNode = 0;

				var currentGridX = (nme.x / TILESIZE) | 0;
				var currentGridY = (nme.y / TILESIZE) | 0;
				AI.findPath(nme, currentGridX, currentGridY, AI.goalX, AI.goalY);

			} else if (nme.currentPath && !nme.waitingForPath) {
				//if (debugmode) log('Entity has a currentPath');

				if ((nme.pathCurrentNode < nme.currentPath.length - 1) && nme.currentPath[nme.pathCurrentNode + 1]) {
					nme.destinationX = nme.currentPath[nme.pathCurrentNode + 1].x * TILESIZE + TILESIZEDIV2; // + wobbleAI();
					nme.destinationY = nme.currentPath[nme.pathCurrentNode + 1].y * TILESIZE + TILESIZEDIV2; // + wobbleAI();

					// move towards our next waypoint
					// and switch animations accordingly
					if (nme.destinationY > nme.y) {
						nme.y += nme.speed;
						nme.currentAnimation = nme.move_s;
					}
					if (nme.destinationY < nme.y) {
						nme.y -= nme.speed;
						nme.currentAnimation = nme.move_n;
					}
					if (nme.destinationX > nme.x) {
						nme.x += nme.speed;
						nme.currentAnimation = nme.move_e;
					}
					if (nme.destinationX < nme.x) {
						nme.x -= nme.speed;
						nme.currentAnimation = nme.move_w;
					}

					// rotate nicely - good for racing games or pure top view
					// lookAt(nme, nme.destinationX, nme.destinationY);

					// only animate if moving
					// animate using the spritesheet - if specified: might be a static sprite (tower)
					if (nme.currentAnimation) {
						nme.setImage(nme.currentAnimation.next());
						if (nme.currentAnimation.atLastFrame()) {
							if (nme.dying) { // todo fixme - unimplemented - need anim art
								nme.active = false;
								nme.dying = false;
								nme.dead = true;
								//nme.currentAnimation = nme.deathanim;
								//anentity.setImage(anentity.move_n.frames[0]);
								if (debugmode)
									log('Death anim completed');
							}
						}
					}

					if (closeEnough(nme.destinationX, nme.destinationY, nme.x, nme.y, 5)) {
						nme.pathCurrentNode++;
						if (debugmode > 2)
							log('entityAI arrived at ' + nme.destinationX + ',' + nme.destinationY);
						if (debugmode > 2)
							log('entityAI next path node: ' + nme.pathCurrentNode);
					}
				} else {
					if (debugmode)
						log('entityAI finished entire path!');
					nme.currentPath = null;
					// for this game, once we reach the destination we've completed our objective!
					attackCastle(nme);
				}

			}
		} // movement
	}

	/**
	 * Inits the sound engine by preloading the appropriate sound data
	 * ogg and wav versions are only used for online webpage versions
	 * in order to account for varying codec availability between browsers
	 * in win8 store apps, only the mp3 is loaded
	 * NOTE: this has no effect when using wp8 which uses C++ XSound code
	 */
	function soundInit() {
		if (debugmode)
			log('soundInit...');
		profile_start('soundInit');
		// start the ambient music immediately - while downloading sprites
		soundMusic = new Howl({
				urls : ['game-media/music.mp3', 'game-media/music.ogg', 'game-media/music.wav'],
				// this should be true but it never loops if we stream
				buffer : false, // stream - start playing before all is downloaded: forces use of html5audio
				autoplay : true,
				loop : true,
				volume : 0.25 // quieter
			});

		// wp8 only sound hack: FIXME TODO
		sfx.play('music');

		profile_end('soundInit');
	}

	/**
	 * Triggered when the level has been successfully cleared.
	 * Switches to the transition state before loading the next level.
	 */
	function levelComplete() {
		if (debugmode)
			log('Level ' + current_level_number + ' complete!');
		updateGUIsprites(GoldGUI, player_Gold); // immediate update to proper value
		//transition_mode = TRANSITION_LEVEL_COMPLETE; // fixme todo we probably don't want to reset things here. TODO: check that it is always set
		pendingLevelComplete = false;
		jaws.switchGameState(LevelTransitionScreenState);
	}

	/**
	 * Ends the game and returns to the title screen
	 */
	function gameOver(beatTheGame) {
		if (debugmode)
			log('gameOver!');

		if (beatTheGame) {
			if (debugmode)
				log('VICTORY!');
		}

		// clear any previous timers just in case
		if (game_timer)
			window.clearInterval(game_timer);

		game_over = true;

		// FIXME TODO - this works except old data still in ram!
		// for beta we just reload the page instead. FIXME TODO
		jaws.switchGameState(TitleScreenState);
		//document.location.reload(false); // false means use the cache
	}

	/**
	 * Changes the sprites used by a SpriteList (score, time, counter, etc) eg. 00000FAR_AWAY9
	 * updateGUIsprites cannot handle negative numbers: only 0..9 in the spritesheet
	 */
	function updateGUIsprites(gui, num) {
		if (!gui_enabled)
			return;
		// individual digits
		//if (debugmode) log('updateGUIsprites: using ' + gui.length + ' digit sprites to display: ' + num);
		var digitcount = 0;
		var digit = 0;
		var digitsprite = gui.at(digitcount + 1); // +1 because the "label" is the first sprite
		while (digitsprite) {
			digit = Math.floor(num % 10);
			if (digit < 0)
				digit = 0; // eg if num is -1
			num = Math.floor(num / 10);
			digitsprite.setImage(fontSpriteSheet.frames[digit]);
			digitcount++;
			digitsprite = gui.at(digitcount + 1);
		}
	}

	/**
	 * Changes the sprites used by the GoldGUI,
	 * counting by 1 each call until we reach player_Gold
	 */
	function updateGoldGUI() {
		if (displayedGold == player_Gold)
			return;

		// don't fall too far behind
		if (Math.abs(player_Gold - displayedGold) > 200)
			displayedGold = player_Gold;
		else {
			if (player_Gold > displayedGold)
				displayedGold++;
			else
				displayedGold--;
		}

		updateGUIsprites(GoldGUI, displayedGold);
	}

	/**
	 * inits a new level using json data: sets level specific variables 
	 */
	function initLevel(leveldata) {
		profile_start('initLevel');
		if (debugmode)
			log('initLevel...');
		if (!leveldata) {
			if (debugmode)
				log('ERROR: Missing level data!');
			return;
		}
		if (!leveldata.properties) {
			if (debugmode)
				log('ERROR: Missing level.properties!');
			return;
		}

		// clear any previous levels from memory
		world_complexity = 0; // tile count

		// calculate pathfinding costs
		AI.newGrid(leveldata.layers[1].data, leveldata.width, leveldata.height);

		// remove any leftover terrain from a previous level
		if (terrainSprite)
			game_objects.remove(terrainSprite);
		// the pre-rendered map terrain eg level0.png level1.png level2.png etc
		terrainSprite = new jaws.Sprite({
				image : jaws.assets.get("level" + (current_level_number) + ".png"),
				x : 0,
				y : 0
			});
		// put the new terrain at the very first index in the game_objects spritelist array
		game_objects.unshift(terrainSprite); // why unshift and not push? so the terrain is always drawn before the buildMenu

		// unused
		time_remaining = 0;
		time_direction = 1; // count up
		gameover_when_time_runs_out = false;

		if (leveldata.properties.start_tile) {
			var startarray = String(leveldata.properties.start_tile).split(",");
			startx = parseInt(startarray[0] * leveldata.tilewidth, 10);
			starty = parseInt(startarray[1] * leveldata.tileheight, 10);
			if (debugmode)
				log('Respawn start point is: ' + startx + ',' + starty);
		}

		viewport_max_x = leveldata.width * leveldata.tilewidth;
		viewport_max_y = (leveldata.height + 2) * leveldata.tileheight; // extend past the level data: fell_too_far + 1;

		if (debugmode)
			log('initLevel complete.');

		if (debugmode)
			log('Total tiles in the world: ' + world_complexity);

		profile_end('initLevel');
	}

	/**
	 * Adds a new entity to the world
	 * returns the sprite
	 */
	function spawnEntity(worldx, worldy, race, team) {

		profile_start('spawnEntity');

		// handle unknown races by looping over 1,2,3,4
		if (race < 1)
			race = ENTITY_MIN_RACE;
		if (race > 4)
			race = ENTITY_MAX_RACE;

		if (debugmode)
			log('spawnEntity ' + worldx + ',' + worldy + ' Race ' + race + ' Team ' + team);

		num_entities++;

		var anentity = new jaws.Sprite({
				x : worldx,
				y : worldy,
				anchor : "center_bottom"
			});

		// we can reuse some healthbar sprites
		if (!healthbarImage.length) {
			if (debugmode)
				log('Lazy init healthbar images');
			healthbarImage[0] = chopImage(jaws.assets.get("entities.png"), 32, 0, 32, 8);
			healthbarImage[1] = chopImage(jaws.assets.get("entities.png"), 32, 8, 32, 8);
			healthbarImage[2] = chopImage(jaws.assets.get("entities.png"), 32, 16, 32, 8);
			healthbarImage[3] = chopImage(jaws.assets.get("entities.png"), 32, 24, 32, 8);
		}

		// all image frames for all entities
		// we currently use four different units: 1..4
		if (!entityanimation.length) {
			if (debugmode)
				log('Lazy init entityanimations');
			if (debugmode)
				log("Chopping up unit1 animation spritesheet...");
			entityanimation[1] = new jaws.Animation({
					sprite_sheet : jaws.assets.get("unit1.png"),
					orientation : 'right',
					frame_size : entity_framesize,
					frame_duration : entity_animation_framerate
				});
			if (debugmode)
				log("Chopping up unit2 animation spritesheet...");
			entityanimation[2] = new jaws.Animation({
					sprite_sheet : jaws.assets.get("unit2.png"),
					orientation : 'right',
					frame_size : entity_framesize,
					frame_duration : entity_animation_framerate
				});
			if (debugmode)
				log("Chopping up unit3 animation spritesheet...");
			entityanimation[3] = new jaws.Animation({
					sprite_sheet : jaws.assets.get("unit3.png"),
					orientation : 'right',
					frame_size : entity_framesize,
					frame_duration : entity_animation_framerate
				});
			if (debugmode)
				log("Chopping up unit4 animation spritesheet...");
			entityanimation[4] = new jaws.Animation({
					sprite_sheet : jaws.assets.get("unit4.png"),
					orientation : 'right',
					frame_size : entity_framesize,
					frame_duration : entity_animation_framerate
				});
		}

		if (!towerImages.length) {
			if (debugmode)
				log('Lazy init towerImages');
			towerImages[1] = chopImage(jaws.assets.get("entities.png"), 0, 32, 64, 96);
			towerImages[2] = chopImage(jaws.assets.get("entities.png"), 64, 32, 64, 96);
			towerImages[3] = chopImage(jaws.assets.get("entities.png"), 128, 32, 64, 96);
		}

		if (team == TEAM_BAD) // then we want walking avatars
		{
			// all animations used by our hero
			// we make new anims for each entity so they aren't synched the same
			anentity.idle_anim = entityanimation[race].slice(0, 1);
			anentity.attack_anim = entityanimation[race].slice(0, 1);
			anentity.move_n = entityanimation[race].slice(0, 7);
			anentity.move_w = entityanimation[race].slice(8, 15);
			anentity.move_s = entityanimation[race].slice(16, 23);
			anentity.move_e = entityanimation[race].slice(24, 31);
			//anentity.deathanim = entityanimation[race].slice(32, 31);
			anentity.currentAnimation = anentity.move_n;
			anentity.setImage(anentity.move_n.frames[0]);
			anentity.speed = BASE_ENTITY_SPEED;
			// for now, walkers have no weapon!
			//anentity.weapon = new GameWeapon();
			anentity.weapon = null;
			anentity.enemySpriteList = null;
		} else // a tower - goodguy player
		{
			anentity.setImage(towerImages[race]);
			// the artwork needs a nudge since it is taller - fixme todo: hardcoded tower sprite size
			anentity.anchor_y = 0.75;
			anentity.cacheOffsets();
			anentity.speed = 0; // player entities never move in this game (but they could in yours!)
			anentity.weapon = new GameWeapon(race);
			anentity.enemySpriteList = teams[TEAM_BAD];
		}

		// callback functions
		anentity.entitytype = race; // see above

		// teams
		anentity.team = team;

		// defaults
		anentity.active = true;
		anentity.health = 100;

		// health bar:
		anentity.healthbarsprite = new jaws.Sprite({
				x : anentity.x,
				y : anentity.y + HEALTHBAROFFSET,
				anchor : "center_bottom"
			});
		anentity.healthbarsprite.setImage(healthbarImage[0]);
		healthbarsprites.push(anentity.healthbarsprite);

		// store this sprite for easy access and iteration during update and draw
		entities.push(anentity);

		// optimization for collision detection, etc.
		teams[team].push(anentity);

		profile_end('spawnEntity');

		return anentity;

	}

	function removeEntity(victim) {
		if (debugmode)
			log('removeEntity');
		victim.active = false; // ready to respawn/reuse
		// stop drawing and updating
		entities.remove(victim);
		// stop checking collisions
		teams[victim.team].remove(victim);
		// stop drawing its healthbar
		if (victim.healthbarsprite)
			healthbarsprites.remove(victim.healthbarsprite);
		// check if we completed the level (eg all badguys destroyed?) fixme todo: maybe just current ones: waves
		checkLevelComplete();
	}

	// fixme todo this could be a entity.function
	function takeDamage(victim, fromwho) {
		if (debugmode)
			log('Damage! Victim has ' + victim.health + ' hp minus ' + fromwho.weapon.damage);

		// queue up a particle effect for the near future
		victim.pendingParticles = 1; // smoke for a while? no, just once
		victim.pendingParticleType = fromwho.weapon.particleHit;
		// delay the explosion so projectile has time to get there
		victim.nextPartyTime = currentFrameTimestamp + PROJECTILE_EXPLOSION_DELAY;

		// also queue up damage for after the projectile flies through the air
		victim.pendingDamage = fromwho.weapon.damage;
		victim.pendingAttacker = fromwho;

		/*
		victim.health -= fromwho.weapon.damage;
		if (victim.healthbarsprite) {
		if (victim.health > 75) victim.healthbarsprite.setImage(healthbarImage[0]);
		else if (victim.health > 50) victim.healthbarsprite.setImage(healthbarImage[1]);
		else if (victim.health > 25) victim.healthbarsprite.setImage(healthbarImage[2]);
		else victim.healthbarsprite.setImage(healthbarImage[3]);
		}

		if (victim.health <= 0) {
		if (debugmode) log('Entity destroyed!');
		// if we just died: play particle immediately! (else it gets skipped since entityAI is never run)
		//startParticleSystem(victim.x, victim.y + ENTITY_PARTICLE_OFFSETY, fromwho.weapon.particleHit);
		victim.active = false;
		victim.dead = true;
		victim.speed = 0;
		if (!includeDeadBodies) {
		removeEntity(victim);
		}
		else {
		// a little random death location
		victim.rotateTo(90 + (Math.random() * 10 - 5)); // lie down - simple!
		victim.x += Math.random() * 8 - 4;
		victim.y += Math.random() * 8 - 4;
		victim.alpha = 0.5; // slightly transparent
		// stop checking collisions
		teams[victim.team].remove(victim);
		// stop drawing its healthbar
		if (victim.healthbarsprite) healthbarsprites.remove(victim.healthbarsprite);
		// check if we completed the level (eg all badguys destroyed?) fixme todo: maybe just current ones: waves
		checkLevelComplete();
		}
		}
		 */
	}

	// this is called when enemies reach their destination and damage the castle
	function checkLevelComplete() {
		if (player_Health < 1) {
			if (debugmode)
				log('The player has no more health! LEVEL COMPLETE GAME OVER!'); // fires 2x or more?
			pendingLevelComplete = true;
			//sfxdie();
			transition_mode = TRANSITION_GAME_OVER;
			//jaws.switchGameState(LevelTransitionScreenState); // the pendingLevelComplete above will make this happen soon
			return;
		}

		if (!teams[TEAM_BAD].length) {
			if (debugmode)
				log('The badguy team is empty!');
			if (wave_none_left) {
				if (debugmode)
					log('And there are no pending waves! LEVEL COMPLETE SUCCESS!');
				//levelComplete(); // might get called more than once if we run it here
				transition_mode = TRANSITION_LEVEL_COMPLETE;
				pendingLevelComplete = true; // handle edge case: we hit >1 in the same frame
			}
		}
	}

	function buildMenuMove(px, py) {
		if (!buildMenuSprite)
			return;
		buildMenuSprite.moveTo(px, py);
		buildMenuOverlay1.moveTo(px, py - 40);
		buttonHighlight[0].moveTo(px, py - 40 + 8);
		buildMenuOverlay2.moveTo(px - 64, py + 25);
		buttonHighlight[1].moveTo(px - 64, py + 25 + 7);
		buildMenuOverlay3.moveTo(px + 64, py + 25);
		buttonHighlight[2].moveTo(px + 64, py + 25 + 7);
	}

	function buildMenuOFF() {
		if (debugmode)
			log('Turning off the buildMenu');
		buildMenuActive = false;
		buildMenuMove(FAR_AWAY, FAR_AWAY);
		buildChoice1tileX = FAR_AWAY;
		buildChoice1tileY = FAR_AWAY;
		buildChoice2tileX = FAR_AWAY;
		buildChoice2tileY = FAR_AWAY;
		buildChoice3tileX = FAR_AWAY;
		buildChoice3tileY = FAR_AWAY;
		buildPendingPixelX = FAR_AWAY;
		buildPendingPixelY = FAR_AWAY;
		buildPendingTileX = FAR_AWAY;
		buildPendingTileY = FAR_AWAY;
	}

	function getTileType(tileX, tileY) {
		var tileStyle = 0;
		// which kind of tile did we click?
		if (AI && AI._grid && AI._grid[tileY]) {
			tileStyle = AI._grid[tileY][tileX];
		}
		if (debugmode)
			log('getTileType(' + tileX + ',' + tileY + ')=' + tileStyle);
		return tileStyle;
	}

	function setTileType(tileX, tileY, setTo) {
		if (debugmode)
			log('setTileType(' + tileX + ',' + tileY + ') to ' + setTo);
		if (AI && AI._grid && AI._grid[tileY]) {
			AI._grid[tileY][tileX] = setTo;
		}
	}

	/**
	 * Click a world tile - TileClick
	 * Normally a build command - called from onPointerDown
	 */
	function clickTile(tileX, tileY) {
		if (debugmode)
			log('clickTile ' + tileX + ',' + tileY);

		if (game_over)
			return;

		var cameraMoveRequired = false;

		/*
		// if we're in the cinematic, exit now and ignore click
		if (introSceneNumber < 99) {
		if (debugmode) log('Skipping intro cinematic');
		introSceneNumber = 99;
		introCinematic();
		return;
		}
		 */

		var tileStyleClicked = getTileType(tileX, tileY);

		// game world pixel coords
		var px = tileX * TILESIZE + TILESIZEDIV2;
		var py = tileY * TILESIZE + TILESIZEDIV2;

		// debug only
		debugTouchInfo = '' + tileX + ',' + tileY + ':' + px + ',' + py + '=' + tileStyleClicked;

		// lazy init the sprites on demand - only happens the first time
		if (!buildMenuSprite) {
			if (debugmode)
				log('Creating buildMenuSprite');
			// the ring of buttons GUI
			buildMenuSprite = new jaws.Sprite({
					image : jaws.assets.get("buildmenu.png"),
					anchor : "center_center"
				});
			game_objects.push(buildMenuSprite);
			// the overlay that obscures items we can't afford
			buildMenuOverlay1 = extractSprite(jaws.assets.get("gui.png"), 272, 464, 50, 50, {
					anchor : "center_bottom"
				});
			buildMenuOverlay2 = extractSprite(jaws.assets.get("gui.png"), 272, 464, 50, 50, {
					anchor : "center_bottom"
				});
			buildMenuOverlay3 = extractSprite(jaws.assets.get("gui.png"), 272, 464, 50, 50, {
					anchor : "center_bottom"
				});
			game_objects.push(buildMenuOverlay1);
			game_objects.push(buildMenuOverlay2);
			game_objects.push(buildMenuOverlay3);
			// the clickable buttons (a glowing yellow outline so we know we have enough money)
			buttonHighlightImageON = chopImage(jaws.assets.get("gui.png"), 0, 320, 64, 64);
			buttonHighlightImageOFF = chopImage(jaws.assets.get("gui.png"), 288, 320, 64, 64);
			buttonHighlight[0] = new jaws.Sprite({
					image : buttonHighlightImageON,
					anchor : "center_bottom"
				});
			buttonHighlight[1] = new jaws.Sprite({
					image : buttonHighlightImageON,
					anchor : "center_bottom"
				});
			buttonHighlight[2] = new jaws.Sprite({
					image : buttonHighlightImageON,
					anchor : "center_bottom"
				});
			game_objects.push(buttonHighlight[0]);
			game_objects.push(buttonHighlight[1]);
			game_objects.push(buttonHighlight[2]);
		}

		// fixme todo: the buildChoice1tileX etc is a hack: use guiSprites action and remember pending build xy

		if (!buildMenuActive) // we ARE allowed to build here and menu is off
		{
			// are we allowed to build here?
			if (tileStyleClicked != TILE_INDEX_BUILDABLE) {
				if (debugmode)
					log('We cannot build on this style of tile.');
				//sfx.play('NotEnoughMoney');
				// hide the menu
				buildMenuOFF();
			} else {
				if (debugmode)
					log('Turning on the buildMenu');
				buildMenuActive = true;
				buildMenuMove(px, py);
				buildChoice1tileX = tileX;
				buildChoice1tileY = tileY - 1;
				buildChoice2tileX = tileX - 1;
				buildChoice2tileY = tileY;
				buildChoice3tileX = tileX + 1;
				buildChoice3tileY = tileY;
				buildPendingPixelX = px;
				buildPendingPixelY = py;
				buildPendingTileX = tileX;
				buildPendingTileY = tileY;
				sfx.play('openBuildMenu');
			}
			// don't do any building at this point!
			// we just made the menu visible - wait for another click.
			cameraMoveRequired = true;
			//return;
		} else // buildMenuActive = true
		{
			selectedBuildingStyle = FAR_AWAY;

			// fixme todo this should never be true?
			if (getTileType(buildPendingTileX, buildPendingTileY) != TILE_INDEX_BUILDABLE) {
				if (debugmode)
					log('The pending build location already has a tower!');
			}

			if (tileX == buildChoice1tileX && tileY == buildChoice1tileY) {
				selectedBuildingStyle = 0;
			}
			if (tileX == buildChoice2tileX && tileY == buildChoice2tileY) {
				selectedBuildingStyle = 1;
			}
			if (tileX == buildChoice3tileX && tileY == buildChoice3tileY) {
				selectedBuildingStyle = 2;
			}

			if (selectedBuildingStyle == FAR_AWAY) {
				if (debugmode)
					log('User cancelled build menu');
				buildMenuOFF();
				cameraMoveRequired = true; // click away means distracted - move there now!
				//return;
			} else // valid building selected
			{

				if (debugmode)
					log('Requesting to build tower ' + selectedBuildingStyle);

				// can we afford it?
				if (player_Gold < buildCost[selectedBuildingStyle]) {
					if (debugmode)
						log('We cannot afford to build this unit: we have ' + player_Gold + ' gold but need ' + buildCost[selectedBuildingStyle]);
					// fixme todo play buzzer sound, flash gold, flash progress bars
					sfx.play('NotEnoughMoney');
					//return;
				} else // we have enough money
				{

					sfx.play('Build');

					startParticleSystem(buildPendingPixelX, buildPendingPixelY, particleBUILD);

					// spawn a new tower here
					var justBuilt = spawnEntity(buildPendingPixelX, buildPendingPixelY, selectedBuildingStyle + 1, TEAM_GOOD); // tower 1,2,3

					// pay up!
					player_Gold -= buildCost[selectedBuildingStyle];

					// debug fixme todo lame - buildMenu!
					selectedBuildingStyle++;
					if (selectedBuildingStyle > 2)
						selectedBuildingStyle = 0;

					updateGoldGUI();

					// don't let the entities move here anymore
					// fixme todo handle times when an entity is underneath a building! for PATHING (building on the road!)
					// not used but great for future pathing strategies by building on walkable tiles?
					AI.astar.avoidAdditionalPoint(buildPendingTileX, buildPendingTileY);
					// if dynamic pathfinding, we will need to clear entity.path and redo the AI._grid most likely todo fixme

					// so that we don't build multiple towers on the same spot
					setTileType(buildPendingTileX, buildPendingTileY, TILE_INDEX_BUILTUPON);

					// we successfully built something - done with menu!
					buildMenuOFF();
				} // if we have enough gold
			} // valid building button clicked
		} // build menu was visible

		// chase camera scroll if we just clicked the world and not the gui
		if (cameraMoveRequired)
			moveCamera(px, py);

	}

	function guiClickMaybe(px, py) {
		if (debugmode)
			log('guiClickMaybe ' + px + ',' + py);
		var weClickedSomething = false;
		// loop through any sprites in this list
		guiButtonSprites.filter
		(
			function (nextone) {
			return nextone.rect().collidePoint(px, py);
		}).forEach
		(
			// run the sprite's action() function if it exists
			function (nextone) {
			if (debugmode)
				log('GUI button was clicked!');
			// trigger, if any
			if (nextone.action) {
				weClickedSomething = true;
				nextone.action(px, py);
			}
		});
		return weClickedSomething;
	}

	/**
	 * generic pointer down event for the game's canvas
	 * works for touch, w8, wp8, multitouch, etc.
	 * Assumes that the canvas is at 0,0 in the html page
	 * Takes into account the scrolling viewport
	 */
	function onPointerDown(evt) {
		if (debugmode)
			log('onPointerDown ' + evt.clientX + ',' + evt.clientY);

		// used by the level select screen levelSelectSprite
		if (showing_levelselectscreen) {
			if (!guiClickMaybe(evt.clientX, evt.clientY)) {
				if (debugmode)
					log('showing_levelselectscreen GUI not touched');
			}
		}

		if (!viewport)
			return; // clicks before game inits

		if (game_over) {
			return; // during the menu
		}

		evt.preventDefault();

		//pointerDown[evt.pointerId] = true;
		//lastPositions[evt.pointerId] = { x: evt.clientX, y: evt.clientY};
		var px = evt.clientX + viewport.x;
		var py = evt.clientY + viewport.y;
		var tx = Math.floor(px / TILESIZE);
		var ty = Math.floor(py / TILESIZE);
		//startParticleSystem(px, py); // world pixel coords

		if (!guiClickMaybe(px, py)) {
			clickTile(tx, ty);
		}

		// always change camera? moved to clicktile to avoid scrolling when gui is clicked
		// moveCamera(px,py);

	}

	// tween me, baby!
	var cameraTween = null;
	function moveCamera(px, py) {
		if (!viewport)
			return;

		// sanity check - don't go too far off screen
		if (px < (-jaws.width / 3))
			px = (-jaws.width / 3);
		if (py < (-jaws.height / 3))
			py = (-jaws.height / 3);
		if (px > viewport_max_x + (jaws.width / 3))
			px = viewport_max_x + (jaws.width / 3);
		if (py > viewport_max_y + (jaws.height / 3))
			py = viewport_max_y + (jaws.height / 3);

		var gotoX = (px - jaws.width / 2) | 0;
		var gotoY = (py - jaws.height / 2) | 0;

		// instant: works!
		//viewport.x = gotoX;
		//viewport.y = gotoY;

		var position = {
			x : viewport.x,
			y : viewport.y
		};
		var target = {
			x : gotoX,
			y : gotoY
		};

		//if (!cameraTween) {

		// create a new tween object - GC warning - can we avoid this? fixme todo
		cameraTween = new tween.Tween(position).to(target, 1000);

		//cameraTween.easing(TWEEN.Easing.Linear.None); // lame works


		// only bounce on the destination - like my early demos - works with the above 4000ms
		//cameraTween.easing(TWEEN.Easing.Elastic.Out); // too bouncy!

		cameraTween.easing(tween.Easing.Quadratic.InOut); // wp8 was TWEEN

		//cameraTween.easing(TWEEN.Easing.Elastic.InOut); // too bouncy!

		// define an anonymous function within it
		cameraTween.onUpdate(
			function () {
			//if (debugmode) log('Tween onUpdate...');
			viewport.x = position.x;
			viewport.y = position.y;
		});

		cameraTween.onComplete(
			function () {
			if (debugmode)
				log('Tween completed!');
			//nme.tweener.to(newtarget);
		});

		cameraTween.start();
		//}

	}

	/*
	// interesting algorithm to grab any value independent of timers etc
	function getTweenedValue(startVal, endVal, currentTime, totalTime, tweener) {
	var delta = endVal - startVal;
	var percentComplete = currentTime/totalTime;
	tweener ||= TWEEN.Easing.Linear.EaseNone;
	return tweener(percentComplete) * delta + startVal
	}
	var val = getTweenedValue(0,300,1000,2000);
	 */

	/**
	 * Detects the availability of touch input (on tablets, etc)
	 * and starts listening for pointer events as required
	 */
	function initMSTouchEvents() {

		// no ipad drag
		document.addEventListener('touchmove', function (e) {
			e.preventDefault();
		}, false);

		if (!jaws.canvas)
			throw "We tried to add a point event listener before the game canvas was created.";
		jaws.canvas.addEventListener("PointerDown", onPointerDown, false);
		// in some browsers, the above does nothing: also listen for regular events
		jaws.canvas.addEventListener("mousedown", onPointerDown, false);
		// and the MS specific version, too
		jaws.canvas.addEventListener("MSPointerDown", onPointerDown, false);

		if (window.navigator.msPointerEnabled) {
			if (debugmode)
				log('MS pointer events are enabled.');

			if (window.navigator.msMaxTouchPoints) {
				if (debugmode)
					log('MS touches (x' + window.navigator.msMaxTouchPoints + ' points max) are available.');
			}
		}

		// dont't let any mouse/touch select things: this is a game
		document.addEventListener("selectstart", function (e) {
			e.preventDefault();
		}, false);
		// dont't let touch-and-hold (or right click) create a context menu
		document.addEventListener("contextmenu", function (e) {
			e.preventDefault();
		}, false);
		// don't show the hint visual for context menu either
		document.addEventListener("MSHoldVisual", function (e) {
			e.preventDefault();
		}, false);

		if (debugmode)
			log('initMSTouchEvents completed.');
	}

	/**
	 * moves all GUI sprites around depending on window size
	 * this function allows TowerGameStarterKit games to be "responsive"
	 */
	function liquidLayoutGUI() {
		if (debugmode)
			log('liquidLayoutGUI');

		var n = 0; // gui sprite loop counter

		CREDITS_BUTTON_X = (jaws.width / 2) | 0;
		// move any msgboxes/GUIs that are centered:
		if (gameoverSprite)
			gameoverSprite.moveTo((jaws.width / 2) | 0, ((jaws.height / 2) | 0) - 42);
		if (beatTheGameSprite)
			beatTheGameSprite.moveTo((jaws.width / 2) | 0, ((jaws.height / 2) | 0) + 42);
		if (levelcompleteSprite)
			levelcompleteSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
		if (menuSprite)
			menuSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2 + 40) | 0);
		if (creditsSprite)
			creditsSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
		if (splashSprite)
			splashSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
		if (msgboxSprite)
			msgboxSprite.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0); // (jaws.height / 2 + 8) | 0); if the shadow makes it not vistually centered
		if (PausedGUI)
			PausedGUI.moveTo((jaws.width / 2) | 0, (jaws.height / 2) | 0);
		// move the gui timer/score/count

		if (WaveGUIlabel)
			WaveGUIlabel.moveTo(wave_gui_x, wave_gui_y);
		if (GoldGUIlabel)
			GoldGUIlabel.moveTo(gold_gui_x, gold_gui_y);
		if (HealthGUIlabel)
			HealthGUIlabel.moveTo(health_gui_x, health_gui_y);

		if (WaveGUI) {
			for (n = 0; n < wave_gui_digits; n++) {
				WaveGUI.at(n + 1).moveTo(wave_gui_x + wave_gui_digits_offset + (wave_gui_spacing * wave_gui_digits) - (wave_gui_spacing * n), wave_gui_y);
			}
		}
		if (GoldGUI) {
			for (n = 0; n < gold_gui_digits; n++) {
				GoldGUI.at(n + 1).moveTo(gold_gui_x + gold_gui_digits_offset + (gold_gui_spacing * gold_gui_digits) - (gold_gui_spacing * n), gold_gui_y);
			}
		}
		if (HealthGUI) {
			for (n = 0; n < health_gui_digits; n++) {
				HealthGUI.at(n + 1).moveTo(health_gui_x + health_gui_digits_offset + (health_gui_spacing * health_gui_digits) - (health_gui_spacing * n), health_gui_y);
			}
		}
	}

	/**
	* returns the next new entity in the waves of enemies for each level
	*/
	function waveSpawnNextEntity() {

		// avoid edge case race condition: ensure the game's up and running
		if (!currentFrameTimestamp)
			return;

		if (debugmode)
			log('Level:' + current_level_number + ' Wave:' + wave_current + ' Ent:' + wave_entitynum + ' at ' + currentFrameTimestamp);

		if (!wave[current_level_number]) {
			if (debugmode)
				log('No more levels in the wave data!');
			wave_none_left = true;
			return;
		}

		if (!wave[current_level_number][wave_current]) {
			if (debugmode)
				log('No more waves in this level!');
			wave_none_left = true;
			checkLevelComplete();
			return;
		}

		if (wave_entitynum == 0) // brand new wave just started
		{
			wave_max = wave[current_level_number].length;
			updateGUIsprites(WaveGUI, ((wave_current + 1) * 10) + wave_max); // for "3 of 5" we send 35
			if (debugmode)
				log('NEW WAVE STARTING: ' + (wave_current + 1) + ' of ' + wave_max);
		}

		// none remaining in this wave?
		if (wave[current_level_number][wave_current].length - 1 < wave_entitynum) {
			if (debugmode)
				log('No more entities in this wave!');
			wave_entitynum = 0;
			wave_current++;
			//waveSpawnNextEntity(); // recurse with new numbers - nah, just wait till next heartbeat
			return;
		}

		wave_none_left = false;

		var nextone = wave[current_level_number][wave_current][wave_entitynum];
		// create the new entity from this wave (or just wait if it was a zero)
		if (nextone > 0) {
			// this sound overlaps with too much at the start: removed wp8
			// sfx.play('spawn');
			var birthX = AI.spawnX * TILESIZE + TILESIZEDIV2; // + wobbleAI();
			var birthY = AI.spawnY * TILESIZE + TILESIZEDIV2; // + wobbleAI();
			startParticleSystem(birthX, birthY, particleSPAWN);
			spawnEntity(birthX, birthY, nextone, TEAM_BAD);
		}

		wave_entitynum++;

	}

	/**
	 * this function is used to detect when the screen size has changed
	 * due to rotation of a tablet or going into "snapped" view
	 * it resizes the game canvas and pauses the game
	 */
	function onResize(e) {
		if (debugmode)
			log('onResize!');
		if (debugmode)
			log('window size is now ' + window.innerWidth + 'x' + window.innerHeight);

		if (!window.jaws)
			return; // before we've initialized?

		// for example, on a 1366x768 tablet, swiped to the side it is 320x768
		jaws.canvas.width = window.innerWidth;
		jaws.canvas.height = window.innerHeight;
		jaws.width = jaws.canvas.width;
		jaws.height = jaws.canvas.height;
		if (viewport)
			viewport.width = jaws.canvas.width;
		if (viewport)
			viewport.height = jaws.canvas.height;

		// move the gui elements around
		liquidLayoutGUI();

		// wait for the user to be ready to play
		// fixme todo - in BROWSER this can make unpausing a problem! FIXME TODO
		// only for snapped view and other small displays
		if (window.innerWidth < 321) {
			pauseGame(true);
		} else {
			pauseGame(false);
		}

	}

	/**
	 * Main Game Inits begin here - called by jaws.onload.
	 * Enumerates level data and window events and requests art/sounds to be downloaded.
	 * Many other inits occur only once art/sounds have been loaded:
	 * see TitleScreenState.setup() and PlayState.setup()
	 */
	function initTowerGameStarterKit() {

		if (debugmode)
			log('initTowerGameStarterKit ' + window.innerWidth + 'x' + window.innerHeight);

		// Create a canvas
		var GameCanvas = document.createElement("canvas");
		// liquid layout: stretch to fill
		GameCanvas.width = window.innerWidth;
		GameCanvas.height = window.innerHeight;
		// the id the game engine looks for
		GameCanvas.id = 'canvas';
		// add the canvas element to the html document
		document.body.appendChild(GameCanvas);
		// we want it referenced right now, to be ready for touch event listeners before loading is complete
		jaws.canvas = GameCanvas;

		// a simple scroll can eliminate the browser address bar on many mobile devices
		scrollTo(0, 0); // FIXME: we might need 0,1 due to android not listening to 0,0

		// these are put here only to force them on TOP of the info listing
		profile_start('UPDATE SIMULATION');
		profile_end('UPDATE SIMULATION');
		profile_start('DRAW EVERYTHING');
		profile_end('DRAW EVERYTHING');

		// make sure the game is liquid layout resolution-independent (RESPONSIVE)
		window.addEventListener("resize", onResize, false);

		// listen for touch events if we're running on a Win8 tablet
		initMSTouchEvents();

		// also load all the sounds if required
		if (!mute)
			soundInit();

		// enumerate any level data included in other <script> tags
		var levelnext = 0;
		while (window['level' + levelnext]) {
			level.push(window['level' + levelnext]);
			levelnext++;
		}
		if (debugmode)
			log('Max level number: ' + (levelnext - 1));

		// optionally ensure all gfx data is current by re-downloading everything (no cache)
		// breaks wp8 $ctk
		// if (debugmode) jaws.assets.bust_cache = true;

		// start downloading all the art using a preloader progress screen
		jaws.assets.root = all_game_assets_go_here;
		jaws.assets.add(all_game_assets);

		AI = new Pathfinding(); // the ai class we will use during the game

		if (debugmode)
			log('initTowerGameStarterKit completed.');

		// once the art has been loaded we will create an instance of this class
		// and begin by running its setup function, then the update/draw loop
		jaws.start(TitleScreenState); // the GUI sprites are created here as needed
		//jaws.start(PlayState); // we can't skip the titlescreen due to gui inits
	}

	// callbacks from the intro NPC dialogue voiceover sounds
	function introStarted() {
		if (debugmode)
			log('introStarted');
	}
	function introLoaded() {
		if (debugmode)
			log('introLoaded');
	}
	function introLoadError() {
		if (debugmode)
			log('introLoadError');
	}
	function introNextScene() {
		if (debugmode)
			log('introNextScene');
		introCinematic();
	}

	/**
	 * A simple NPC dialogue cinematic
	 * plays MP3 files and switches GUI around
	 */
	// fixme todo: if we are MUTE or sound is buggy, the intro will never end! use clicks?
	var INTRO_CINEMATIC_SCENECOUNT = 2; // was 6; but it got boring fast.
	function introCinematic() {

		introSceneNumber++;

		if (introSceneNumber > INTRO_CINEMATIC_SCENECOUNT) {
			// fixme todo: good for click to skip intro:
			// if (soundIntro1) soundIntro1.stop();
			introSceneNumber = 999;
			currentIntroCinematicSprite = null;
			introCinematicBG = null;
			if (debugmode)
				log('introCinamatic is over: starting waves!');
			wave_next_spawntime = currentFrameTimestamp - 1; // NOW!
			return;
		}

		if (debugmode)
			log('introCinematic ' + introSceneNumber);

		if (!mute) {

			if (!soundIntroHasBeenPlayed) // only play ONCE. // if multi part intro, remove this check and uncomment soundSettings.urls below
			{
				if (debugmode)
					log('Playing the intro voiceover sound.');

				var soundSettings = {
					volume : 1.0, // 0 to 1
					buffer : false, // if true, stream using HTML5Audio - if false: wait for full download
					onplay : introStarted,
					onload : introLoaded,
					onloaderror : introLoadError,
					onend : introNextScene
				};

				// for intro-1.mp3 2,3,4,5 etc... WORKS!
				//soundSettings.urls = ['game-media/intro-' + introSceneNumber + '.mp3', 'game-media/intro-' + introSceneNumber + '.ogg', 'game-media/intro-' + introSceneNumber + '.wav'];

				soundSettings.urls = ['game-media/intro.mp3', 'game-media/intro.ogg', 'game-media/intro.wav'];
				soundIntro1 = new Howl(soundSettings).play();

				// wp8 sound hack: FIXME TODO
				sfx.play('intro');

				soundIntroHasBeenPlayed = true;

			}
		}

		// hardcoded timer for the intro dialog GUI part 2:
		// why? we can't rely on the sound onend to fire: buggy html5 sound
		window.setTimeout(introCinematic, introCinematicSceneLengthMS[introSceneNumber - 1]);
		// todo fixme: we click to skip the intro, this still fires. disabled: intro plays in full always.

		/*
		Your highness, the peasants are revolting.
		I know that, you fool! That's why we don't allow them in the castle!
		Yes, sire. The peasants have begun a rebellion and are storming the castle gates.
		Then assemble the royal guard. We must crush this uprising!
		Sadly, the guards are all indentured peasants. They've abandoned their posts.
		Very well. Summon the royal architect-mage. We must prepare the tower defenses!
		 */

		// a fantasy map background always looks cool
		if (!introCinematicBG && use_introCinematicBG) {
			introCinematicBG = new jaws.Sprite({
					image : jaws.assets.get("map.png"),
					x : (jaws.width / 2) | 0,
					y : (jaws.height / 2) | 0,
					anchor : "center_center"
				});
		}

		// do we need to init the sprite?
		if (!introCinematicSprites[introSceneNumber]) {

			// centered middle
			//var spriteParams = { x: (jaws.width / 2) | 0, y: (jaws.height /2) | 0, anchor: "center_center" };
			// bottom of screen:
			var spriteParams = {
				x : (jaws.width / 2) | 0,
				y : (jaws.height - 64) | 0,
				anchor : "center_bottom"
			};

			introCinematicSprites[introSceneNumber] = extractSprite(jaws.assets.get("cinematic.png"), 0, 80 * (introSceneNumber - 1), 576, 80, spriteParams);

			// these are clickable (to skip the intro)
			// fixme todo buggy: skipping intro makes WAVE timings overlap! #seehere
			// guiButtonSprites.push(introCinematicSprites[introSceneNumber]);
		}
		// don't let the previous one accept clicks
		if (currentIntroCinematicSprite)
			currentIntroCinematicSprite.action = null;
		currentIntroCinematicSprite = introCinematicSprites[introSceneNumber];
		// we now want to trap clicks on this sprite
		currentIntroCinematicSprite.action = introCinematicSkip;

	}

	function introCinematicSkip() {
		if (debugmode)
			log('Skipping intro cinematic due to clicking a sprite in guiButtonSprites that has an action()');
		introSceneNumber = 999;
		introCinematic();
	}

	this.handleBackButton = function () {
		if (!game_over) {
			console.log('BACK BUTTON: Returning to the main menu from an active game.');
			console.log('[STOP-SENDING-BACK-BUTTON-EVENTS]');
			gameOver(false); // return to previous menu
		} else // already in the titlescreen game state: check credits or level select screen?
		{
			if (showing_credits) {
				console.log('BACK BUTTON: leaving credits - returning to the main menu.');
				console.log('[STOP-SENDING-BACK-BUTTON-EVENTS]');
				showing_credits = false;
				showing_levelselectscreen = false;
				menu_item_selected = 0;
				game_paused = 3; // reset
			} else if (showing_levelselectscreen) {
				console.log('BACK BUTTON: leaving level select screen - returning to the main menu.');
				console.log('[STOP-SENDING-BACK-BUTTON-EVENTS]');
				showing_credits = false;
				showing_levelselectscreen = false;
				menu_item_selected = 0;
				game_paused = 3; // reset
			} else {
				console.log('BACK BUTTON: at the main menu: WE SHOULD NEVER GET HERE: QUIT APP PLEASE!');
				console.log('[SEND-BACK-BUTTON-EVENTS-PLEASE]');
			}
		}
	};

	if (debugmode)
		log('TowerGameStarterKit engine is ready. Waiting for onload event...');

	// All initializations are run once this event fires
	// which occurs after the html page has loaded.
	jaws.onload = initTowerGameStarterKit;

} // end of the TowerGameStarterKit class

/**
* Deal with Windows Phone 8 Back Button so we pass certification
* declared globally so that the function is visible from all scopes
*/
function onWP8BackButton(args) {
	console.log('onWP8BackButton pressed!');
	GAME.handleBackButton();
}

////////////////////////////////////////////////////////////////
// Execution begins here
////////////////////////////////////////////////////////////////
console.log('TowerGameStarterKit.js loaded! Initializing...');

// The entire game runs from within a single class
// alternately, we could just stuff all the above into a closure.
var GAME = new TowerGameStarterKit();
