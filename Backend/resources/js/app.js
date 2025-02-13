import "./bootstrap";

Echo.channel("workspace")
    .on("pusher:subscription_succeeded", () => {
        console.log("Successfully subscribed!");
    })
    .on("pusher:connection_established", () => {
        console.log("Successfully connected!");
    })
    .on("pusher:error", (error) => {
        console.error("Pusher connection error:", error);
    });

Echo.channel("workspace").listen("UpdateInfoWorkspace", (e) => {
    console.log({ e });
});
