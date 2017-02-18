# HTML5 Tower Game Starter Kit by Christer Kaitila

![HTML5 Tower Game Starter Kit](https://raw.github.com/mcfunkypants/TowerGameStarterKit/master/tgsk-logo.png)

I am proud to announce my latest project: the Tower Game Starter Kit for cross-platform HTML5 strategy games.

## What is it?

The TGSK is a simple, open-source (MIT licensed) javascript game engine designed specifically to help you skip "square one" on your way to creating a great Tower Assault or Defense game. Included in the github source repository are project files for Windows 8 Store apps that run on win8 tablets, desktop, and windows RT devices, as well as a project that compiles to Windows Phone 8. In addition, the game runs great on all modern desktop web browsers.

## Features:

- silky-smooth 60fps on most platforms
- levels that are larger than the screen
- spritesheet animation of in-game characters
- touch-screen and mouse controls
- music and sound effects
- particle effects and eye-candy
- a full game complete with a beginning, middle and end
- little extras like a low-level C++ sound engine for wp8
- lots of debug log and benchmarking functionality
- a-star pathfinding for A.I. movement
- entities have health (with visible health bars) and can die
- multiple weapon types with their own particle, sound and damage
- player and computer controlled entities use the same class
- simple codebase with the main engine in just one .js file.
- easy-to-understand code filled with comments

## Play the example game!

Play the example game that comes with the TGSK, "The Peasants are Revolting!" [in your browser right now](http://mcfunkypants.com/Peasants), or download the app from the [Windows 8 Store](http://mcfunkypants.com/tower/win8) or on your [Windows 8 Phone](http://mcfunkypants.com/tower/wp8).

## Tutorials:

This first video is simply a trailer - an introduction to the tower game starter kit that outlines the features and shows off the game in action.

[Watch the Intro Video on YouTube](https://youtu.be/01xNz6NSOFs)

### Code Overview Part 1: Class Properties

In this video tutorial, I outline the main TowerGameStarterKit.js class. We examine the structure of the game class. 

The class uses a number of private methods and properties that you can freely change to suit your own game projects. This helps make the code flexible and easy to modify.

[Watch the Class Properties Video on YouTube](https://youtu.be/KZn2TNH2dtw)

### Code Overview Part 2: Game States

We continue a tour of the source code by eploring how the engine execution flow is set up. 

Once all the art assets have been preloaded, we switch to the first of three "states" which each have a .setup(), .update() and .draw() method. 

The first state used by the game is the titlescreen, which handles an animated menu containing the about/credits screen, and the level select map. 

The second state defined by the game is the level transition state, which is simple a short message showing a little congratulatory (or consoling) message about the results of the previous level, before automatically starting the next level (if one exists). 

The third game state - and the one that is running most of the time during gameplay, is the primary game state, which updates the ai, accepts player input, steps the game simulation and renders all the action.

[Watch the Game States Video on YouTube](https://youtu.be/ulqoMC8Ob6M)

### Code Overview Part 3: Utility/Gameplay Functions

The final part of the tour of our source code explains the many small utility and gameplay functions that are used by the game. 

This includes user input events for touch and mouse, sound functionality, and much more.

[Watch the Utility/Gameplay Functions Video on YouTube](https://youtu.be/dx7k3v4Kg-A)

### Tutorial: win8 project details

This tutorial video briefly explains the project structure of the Windows 8 Store App project, specifically. 

Programming using Visual Studio Express for Windows 8 is my preferred HTML5 editing IDE, since we can enjoy all the best that a professional code editor can offer, such as proper syntax highlighting, great debug tools like breakpoints, watches, stepping through code, and more.

[Watch the win8 project details Video on YouTube](https://youtu.be/P9yGaChpJg0)

### Tutorial: wp8 project details

This tutorial video explains the wp8 (Windows Phone 8) project setup, specifically. 

As you can see, it is similar to, but not quite as feature-rich, as the IDE used when programming for Windows 8 (desktop).

[Watch the wp8 project details Video on YouTube](https://youtu.be/FxYwDcl99do)

### Tutorial: how to debug in wp8

This short tutorial explains the various little extra bits of code that were required to support debugging on wp8 phones (and the emulator). 

In my experience, I found that using an actual physical device (specifically, the Nokia 920) pluggin into a USB port was preferrable to debugging using the emulator.

[Watch the how to debug in wp8 Video on YouTube](https://youtu.be/KzAv7d9HII8)

### Tutorial: open source libraries

This brief video describes the various third-party open-source libraries that are included with the starter kit.

[Watch the open source libraries Video on YouTube](https://youtu.be/lCWAiPuRIfs)

### Tutorial: art asset pipeline

As the final part in our tutorial series, I explore the game-media folder in our source code project. 

All art used in the game is stored in .PNG format, and usually consists of pre-rendered spritesheets that have alpha transparency. 

Level data is stored as a javascript object containing an array of numbers that represent which terrain tiles the enemies can walk on, where they spawn, and what their goal is. 

This pathfinding data is created using [the Tiled level editor](http://www.mapeditor.org/). 

The sound files are encoded in multiple formats to account for varying support for .MP3, .OGG and .WAV. 

Once you know which file contains what sprites, you'll find it easy (and fun) to change all the art assets to make the game your own.

[Watch the art asset pipeline Video on YouTube](https://youtu.be/mqkvd_wEUFU)

