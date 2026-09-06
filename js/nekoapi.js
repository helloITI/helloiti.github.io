async function ld() {
	// this uses the nekoweb API in order to get any website's stats, such as followers, views, etc.
	// you can also borrow this code if you wanna add it to your website! (credits not neccessary, but would be nice)
	
    let ur = 'https://nekoweb.org/api/site/info/hellot.nekoweb.org'; // you can replace "hellot.nekoweb.org" with your nekoweb website instead since idc abt this code anymore
    let ob = await (await fetch(ur)).json(); // stuff
    let cd = new Date(ob.created_at).toLocaleString(); // created at date
    let ud = new Date(ob.updated_at).toLocaleString(); // updated at date

// you can customize this if you want
document.getElementById("pt").innerHTML =
    "<center><h2>My website's stats</h2></center>" +
    "<center>Views: " + ob.views + "</center><br>" + // views
    "<center>Followers: " + ob.followers + "</center><br>" + // followers
    "<center>Updates: " + ob.updates + "</center><br>" + // website updates
    "<center>Created at: " + cd + "</center><br>" + // website creation date
    "<center>Last updated at: " + ud + "</center>"; // website last updated date
}

ld();

// also i don't think this is neccessary anymore beacuse i switched to github pages so idk
