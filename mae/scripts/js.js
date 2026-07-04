function idgaf() {
    const params = new URLSearchParams(window.location.search);
	// New Nintendo 3DS XL
    return params.get("mii") || params.get("avatar") || params.get("wii");
}
window.addEventListener("DOMContentLoaded", () => {
const da = "000000640065006600610075006c00740042006f0079414080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";
    let md =
        idgaf() ||
        localStorage.getItem("avatar") ||
        da;
    // saves to your browser's localStorage if coming from an avatar url or whatever
    if (idgaf()) {
        localStorage.setItem("avatar", md);
    }
    let flashVars = "mii=" + encodeURIComponent(md);
    const embed = document.createElement("embed");
    embed.src = "myavatareditor.swf";
    embed.width = "640";
    embed.height = "500";
    embed.setAttribute("play", "true");
    embed.setAttribute("name", "avatarEditor");
    embed.setAttribute("allowScriptAccess", "always");
    embed.setAttribute("flashvars", flashVars);
    document.getElementById("editorSWFContainer").appendChild(embed);
});
