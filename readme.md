# Race Track Info Screens

A real-time system to control races and inform spectators.


## Before starting the program

- Instal Golang


## Starting the program AS A DEVELOPER

- Install ngrok

Get your token in https://dashboard.ngrok.com/authtokens,   
something like: cr_2mmTDXIW9yeSetpkY5lmFJ0Ctqi

```
ngrok authtoken YOUR_AUTHTOKEN
ngrok http 3000
```

Split the terminal window
```
node server.js
```

Copy your url and type in web browswer window

    https://7243-176-72-149-84.ngrok-free.app/




### OPTIONAL: Example of Client-Side Code Update

If you have a client-side JavaScript file that connects to your server using Socket.IO, you would update the connection URL to use the ngrok URL:

```javascript
// Original connection to local server
// const socket = io("http://localhost:3000");

// Updated connection to use ngrok URL
const socket = io("http://abcd1234.ngrok.io");
```    


## Starting the program AS A TESTER

After the developer has started ngrok, and shared their url, copy the url and type in web browswer window,   
something like:

```
https://7243-176-72-149-84.ngrok-free.app/
```
---------------------------------------------

### Access keys

Front Desk  
Access key: 0000

Race Control    
Access key: 0001

Lap-line Tracker    
Access key: 0002

---------------------------------------------

### Interfaces

**Server**:
   - **Express.js**: Serves static files and handles HTTP routes.
   - **Socket.IO**: Manages real-time communication between clients and the server.
   - **In-memory Storage**: Keeps track of race sessions, drivers, and race state.

#### Receptionist

Front Desk  
/front-desk

Receptionist can add a lists of drivers in races. They can edit and remove drivers.
   - **Login**: Authenticates users and establishes a session.
   - **Manage Sessions**: Interacts with the server to create, update, or delete race sessions.
   - **Manage Drivers**: Communicates with the server to manage driver information.

#### Safety Official

Race Control    
/race-control

Safety official sees the next race list. They can start the session, start the race, change the flags, ens race and end session. Interace is designed for a mobilephone.
   - **Login**: Authenticates users and establishes a session.
   - **Start Session**: Sends a command to the server to initiate a race session.
   - **Control Lights**: Uses Socket.IO to send real-time commands to control race lights.
   - **Start Race**: Signals the server to begin the race.

#### Lap-line Tracker

Lap-line Tracker    
/lap-line-tracker

Lap-line Observer sees the buttons of each car in a current race. Each button repsesents the car id number. Buttons are available only during the race. Interface is designed for a tablet.
   - **Login**: Authenticates users and establishes a session.
   - **Track Laps**: Sends lap data to the server in real-time using Socket.IO.

#### Guest

Leader Board    
leader-board

Guest can see the leaderboard that shows the list af drivers in a current race. Drivers are shown first by car numbers, then by fastest driver. Driver's fastest lap in showing. fastest Leaderboard has a timer and current flag showing.
   - **Display Leader Board**: Shows the current race standings.
   - **Update in Real-Time**: Continuously updates the leader board based on data from the server.

#### Race Driver

Race Driver can see a list of drivers participating in the next race, the timer of currect race, and the current flags in big screens all over the race track.

Next Race   
next-race
   - **Display Drivers for Next Race**: Shows the list of drivers for the upcoming race.

Race Countdown  
race-countdown
   - **Countdown Timer**: Displays a countdown timer for the race start.
   - **SVG Progress**: Shows graphical progress of the countdown.

Race Flag   
race-flags 
   - **Display Flags**: Receives commands from the server to display race flags.
   - **Traffic Lights**: Updates traffic light status in real-time based on server commands.

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|   Front Desk      |       |   Race Control    |       |   Lap Line Tracker|
|                   |       |                   |       |                   |
| - Login           |       | - Login           |       | - Login           |
| - Manage Sessions |       | - Start Session   |       | - Track Laps      |
| - Manage Drivers  |       | - Control Lights  |       |                   |
|                   |       | - Start Race      |       |                   |
+---------+---------+       +---------+---------+       +---------+---------+
          |                           |                           |
          |                           |                           |
          |                           |                           |
          |                           |                           |
          |                           |                           |
          |                           |                           |
          v                           v                           v
+--------------------------------------------------------------------------+
|                                                                          |
|                                Server                                    |
|                                                                          |
| - Express.js for serving static files and routes                         |
| - Socket.IO for real-time communication                                  |
| - In-memory storage for race sessions, drivers, and race state           |
|                                                                          |
| +-------------------+       +-------------------+       +-------------------+
| |                   |       |                   |       |                   |
| |   Race Flags      |       |   Race Countdown  |       |   Leader Board    |
| |                   |       |                   |       |                   |
| | - Display Flags   |       | - Countdown Timer |       | - Display Leader  |
| | - Traffic Lights  |       | - SVG Progress    |       |   Board           |
| |                   |       |                   |       | - Update in Real- |
| |                   |       |                   |       |   Time            |
| +-------------------+       +-------------------+       +-------------------+
|                                                                          |
+--------------------------------------------------------------------------+
          ^                           ^                           ^
          |                           |                           |
          |                           |                           |
          |                           |                           |
          |                           |                           |
          |                           |                           |
          +---------------------------+---------------------------+
                                      |
                                      v
                            +-------------------+
                            |                   |
                            |   Next Race       |
                            |                   |
                            | - Display Drivers |
                            |   for Next Race   |
                            |                   |
                            +-------------------+
```

## SERVER

(Server manages the state of the race)

Routes
    /front-desk, /lap-line-tracker, /leader-board etc...

(Server listens events and performs actions)
(Server emits events to clients to update interfaces in real time)

Socket.IO Events
    startSession, startRace, finishRace, getRaceSessions, lapAdder etc...

## CLIENT SIDE

(Client files listen to events to get the current state of race from server, and update UI)
(Clients emit events to server to perform actions)

- race-flags.js

    updateAnimatedFlag(): updates flag
    startTrafficLightSequence(): starts trafficlights

Socket.IO events:
    raceFlags: updates flag
    startRace: start traffic lights

- race-countdown.js
startCountdown(): starts timer
    updateCountdownDisplay(): updates timer
    updateSVGProgress(): updates circle

Socket.IO events:
    startRace: starts timer

next-race.js

Socket.IO events:
    raceSessions: updates driver list

- leader-board.js
    updateLeaderboard(): updates board
    updateRaceInfo(): updates board, timer, flags
    endRace(): ends race

Socket.IO events:
    raceUpdate: updates race data
    raceStarted: initialize race data, start timer
    raceFlags: updates flags
    lapUpdate: updates laps

- lap-line-tracker.js
    addLap(): adds lap

Socket.IO events:
    authenticated: authentication
    startSession: requests current race session
    carID: store car ID???????????????????????????????
    raceStarted: enables buttons
    raceFinished: removes buttons

- race-control.js
    switchLight(): switch race lights
    turnOffAllLights(): turn off all lights
    updateRaceSessionDisplay(): updates race session display

Socket.IO events:
    authenticated: authentications
    startSession: shows race lights and control buttons
    raceSessions: renders race session
    raceStarted: notifies when race has startes
    raceFinished: nofifies when race has finished
    nextRaceSession: updates next race session display

- front-desk.js
    createDriverEntry(): creates driver entry
    sendCarListToServer(): send car list to server

Socket.IO events:
    authenticated: authentications
    raceSessions: displays race session

## EXAMPLES

Starting the race:
    Race control emits a startRace event
    Server handles startRace event, sets timer, emits racestarted event to clients
    Clients listen raceStarted event and update UI (timer, flags, lap buttons)

Finishing a race:
    Race control emits finishRace event
    Server handles finishRace avent, clears timer, emits raceFinished event to clients
    Clients listen raceFinished event and update UI (flags, remove lap buttons)

Updating Lap data:
    Lap line tracker emits lapAdded event with lap data
    Server handles lapAdded event, updates lap data, emits lapAdded event to clients
    clinets listen lapAdded evetn and update leaderboard with new lap data



---------------------------------------------

## Coders

Jonathan Dahl - Raigo Hoim - Laura Levistö

10/2024






---------------------------------------------
ngrok  opetus video

https://www.youtube.com/watch?v=aFwrNSfthxU