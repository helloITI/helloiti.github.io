async function ld() {
	// this uses the nekoweb API in order to get any website's stats, such as followers, views, etc.
	// you can also borrow this code if you wanna add it to your website! (credits not neccessary, but would be nice)
	// and NO AI was used on this, i basically just looked up tutorials, and thats it.
    let ur = 'https://nekoweb.org/api/site/info/hellot.nekoweb.org';
    let ob = await (await fetch(ur)).json();
    let cd = new Date(ob.created_at).toLocaleString();
    let ud = new Date(ob.updated_at).toLocaleString();
    document.getElementById("pt").innerHTML =
        "<center><h2>※⁜ my website's stats ⁜※</h2></center>" +
        "<center>⁜ views: " + ob.views + " ⁜</center><br>" +
        "<center>⁜ followers: " + ob.followers + " ⁜</center><br>" +
        "<center>⁜ updates: " + ob.updates + " ⁜</center><br>" +
        "<center>⁜ created at: " + cd + " ⁜</center><br>" +
        "<center>⁜ last updated at: " + ud + " ⁜</center>";
}
ld();
// I HATE JAVASCRIPT SO MUCH AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH