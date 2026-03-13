# Appeal Scheduler

We are looking to build a scheduling app that can help automate placing volunteers in designated locations.

## Users:
Users should be able to log in with an email and a password of their choosing. During the sign up process, they should have a separate code to enter that the admins will give to them beforehand. This is also where we differentiate users.

Users will also have a photo (jpeg) and the app will resize it as needed.

Users will have assignments given to them.

There are three types of users:
1. Volunteer (Should be able to see what assignments are given to them)
2. Employee (the actual employee of the company this is for - mostly cosmetic but needed for volunteers to know who to go to for questions)
3. Admins (full CRUD control of users with access to a separate dashboard to see volunteer notes, differentiate volunteers and employees, and see what events are happening currently)

## Events:
Each event has a name, showtype (evening or matinee), location, status (enum), and designated assignments

## Assignments:
Each assignment has a binary value for using extra technical devices, a name, and notes (this can be anything between notes to get into the event or prices of certain items at the event)

## Weekly Survey:
There will be a weekly form for each user to fill out separately. They will record the times they are able to volunteer (pre-determined check boxes), how many people they will be bringing to volunteer with them, where they are willing to volunteer (uptown or downtown only for now), and any notes that the admins can see in order to best fill out their schedules.

## Primary goals:

- Have assignment data displayed at the admin’s discretion for what volunteer is in what position for what event with WHAT other volunteers
- Have photos of the volunteer viewable when their name is clicked on
- Have survey drop down to ask how many volunteers will join them

## Secondary goals:

- Have surveys auto-deployed in-app each week
- Use survey data to suggest assignments on a grid and isolate survey responses that have notes filled out so admins can customize their experience
- Receive updates on show status through the app 
- Maps to event stage doors and possibly internal position maps (this can be ignored for now, Claude. I will have to do this myself.)
