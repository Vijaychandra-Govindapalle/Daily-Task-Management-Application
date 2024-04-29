const { app, BrowserWindow } = require('electron');
const notifier = require('node-notifier');

let appWindow;

function createWindow() {
    appWindow = new BrowserWindow({
        width: 1200,
        height: 900
    });
    appWindow.loadFile('dist/userint/browser/index.html');

    appWindow.on('closed', function() {
        appWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
    
    // Call your function to check for upcoming list start times every minute
    setInterval(checkUpcomingListStartTimes, 60000);
});

function checkUpcomingListStartTimes() {
    // Retrieve upcoming list start times from your backend or storage
    // Compare with current time
    // If any list's start time is approaching, push notifications
    const upcomingLists = [
        { title: 'List 1', startTime: new Date('2024-04-29T10:00:00') },
        { title: 'List 2', startTime: new Date('2024-04-29T20:00:00') }
        // Add more lists as needed
    ];

    const currentTime = new Date();

    upcomingLists.forEach(list => {
        const timeDifference = list.startTime.getTime() - currentTime.getTime();
        const minutesDifference = Math.floor(timeDifference / 60000); // Convert milliseconds to minutes

        // If the start time is within the next 10 minutes, push a notification
        if (minutesDifference > 0 && minutesDifference <= 10) {
            notifier.notify({
                title: 'List Start Time Approaching',
                message: `The start time for ${list.title} is approaching.`
            });
        }
    });

}
