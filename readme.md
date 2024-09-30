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

#### Receptionist

Front Desk  
/front-desk

Receptionist can add a lists of drivers in races. They can edit and remove drivers.

#### Safety Official

Race Control    
/race-control

Safety official sees the next race list. They can start the session, start the race, change the flags, ens race and end session. Interace is designed for a mobilephone.

#### Lap-line Observer

Lap-line Tracker    
/lap-line-tracker

Lap-line Observer sees the buttons of each car in a current race. Each button repsesents the car id number. Buttons are available only during the race. Interface is designed for a tablet.

#### Guest

Leader Board    
leader-board

Guest can see the leaderboard that shows the list af drivers in a current race. Drivers are shown first by car numbers, then by fastest driver. Driver's fastest lap in showing. fastest Leaderboard has a timer and current flag showing.

#### Race Driver

Next Race   
next-race

Race Countdown  
race-countdown

Race Flag   
race-flags 

Race Driver can see a list of drivers participating in the next race, the timer of currect race, and the current flags in big screens all over the race track.

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
---------------------------------------------

## Coders

Jonathan Dahl - Raigo Hoim - Laura Levistö

10/2024






---------------------------------------------
ngrok  opetus video

https://www.youtube.com/watch?v=aFwrNSfthxU