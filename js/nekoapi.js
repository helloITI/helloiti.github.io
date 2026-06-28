async function ld() {
	// this uses the nekoweb API in order to get any website's stats, such as followers, views, etc.
	// you can also borrow this code if you wanna add it to your website! (credits not neccessary, but would be nice)
	// also i don't think this is neccessary anymore beacuse i switched to github pages so idk
    let ur = 'https://nekoweb.org/api/site/info/hellot.nekoweb.org'; // you can replace "hellot.nekoweb.org" with your nekoweb website instead
    let ob = await (await fetch(ur)).json();
    let cd = new Date(ob.created_at).toLocaleString();
    let ud = new Date(ob.updated_at).toLocaleString();
    document.getElementById("pt").innerHTML =
        "<center><h2>My website's stats</h2></center>" +
        "<center>Views: " + ob.views + "</center><br>" +
        "<center>Followers: " + ob.followers + "</center><br>" +
        "<center>Updates: " + ob.updates + "</center><br>" +
        "<center>Created at: " + cd + "</center><br>" +
        "<center>Last updated at: " + ud + "</center>";
}
ld();
// ok bye
