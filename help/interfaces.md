

# Front Desk
### user
- Receptionist
### input
- only authorized people
- See a list of upcoming race sessions.
- Add/Remove race sessions.
- Add/Remove/Edit race drivers. Only a name needs to be captured for each driver. The driver's name must be unique within each race session.
- Past races are erased from the system for the MVP.
- When the receptionist adds drivers to the race session, they are automatically assigned a car to drive. The system can implement any assignment logic.
  


# Race Control
### user
- Safety Official
### input
- only authorized people
- The Safety Official presses a button on their interface, which declares the race is starting. The following also happens:

- The race mode is changed to "Safe"
- The leader board changes to the current race.
- The Next Race screen switches to the subsequent race session.
- The Safety Official sees race mode controls.
  
### The Safety Official has four buttons an their interface once the race starts.
- Safe:	    Solid Green
- Hazard:	Solid Yellow
- Danger:	Solid Red
- Finish:	Chequered Black/White
---
- Once the race mode changes to "Finished", it cannot be changed to any other mode.
---
- Once the race is in Finish mode, and the cars have returned to the pit lane, the Safety Official can end the Session.
- This queues up the next session on the Safety Official's interface, so that they can see which drivers to brief, and which cars the drivers are assigned to.
- The race mode changes to "Danger".
- The Next Race screen now displays the current session's drivers, and displays an extra message to tell them to proceed to the paddock.
  

# Lap-line Tracker
### user
- Lap-line Observer
### input
- only authorized people/access key
- The Lap-line observer has been given a tablet which may be used in landscape or portrait. Their interface requires 1 button for each car which will be pressed as the respective car passes the lap-line. The button must simply have the car's number on it. As many cars cross the lap-line quickly and often, the buttons must be very hard to miss (they must occupy a large tappable area).
- Cars can still cross the lap line when the race is in finish mode. The observer's display should show a message to indicate that the race session is ended once that has been declared by the Safety Official.
- The buttons must not function after the race is ended. They should disappear or be visually disabled.

# Leader Board

### The public displays are 40-75 inch smart displays (monitors with web browsers) which are positioned in guest and race driver areas. Each public display interface must feature a button to launch full-screen mode.

### user
- Guest
### input
- Spectators must be able to see:

- A list of cars and drivers for the current race session, ordered by fastest lap time.
- A timer showing the remaining time of the race session.
- An indication of the flag status.
- The last race session's lap times must be displayed until the next race session is safe to start. This enables drivers to see their lap times after the race has ended.
- The fastest lap time for each car.
- The current lap for each car.


# Next Race

### The public displays are 40-75 inch smart displays (monitors with web browsers) which are positioned in guest and race driver areas. Each public display interface must feature a button to launch full-screen mode.

### user
- Race Driver
### input
- Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

# Race Countdown

### The public displays are 40-75 inch smart displays (monitors with web browsers) which are positioned in guest and race driver areas. Each public display interface must feature a button to launch full-screen mode.

### user
- Race Driver
### input


# Race Flag

### The public displays are 40-75 inch smart displays (monitors with web browsers) which are positioned in guest and race driver areas. Each public display interface must feature a button to launch full-screen mode.

### user
- Race Driver
### input