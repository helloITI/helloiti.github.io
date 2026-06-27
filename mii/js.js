// the stupid themes stuff, whatever.
const dl = document.getElementById("dl");
const bd = document.body;
if (localStorage.getItem("tm") === "dk") {
	bd.classList.add("dk");
	dl.textContent = "※ Light Mode ※";
} else {
	dl.textContent = "※ Dark Mode ※";
}
dl.addEventListener("click", () => {
	bd.classList.toggle("dk");
	const dk = bd.classList.contains("dk");
	dl.textContent = dk ? "※ Light Mode ※" : "※ Dark Mode ※";
	localStorage.setItem("tm", dk ? "dk" : "lt");
});
// the epik music!!!
document.addEventListener("click", function PL() {
	const au = document.getElementById("bg");
	au.play().catch(() => {});
	document.removeEventListener("click", PL);
});
// the credits message pop up, pretty cool, right?
function sg() {
	document.getElementById("mp2").style.display = "flex";
	document.getElementById("cr").innerHTML = `
        <div style="font-size:14px; text-align:left; padding:8px;">
            <b>Credits</b><br><br>
            • <a href="https://discord.com/users/1277753820713324675">helloT</a> for making the entire thing
            <h5 style="display:inline; margin:0; padding:0;">🤣</h5><br>
            • <a href="https://discord.com/users/1406637354709549057">helloT seal</a> for simply just existing here
            <h5 style="display:inline; margin:0; padding:0;">
              <img src="https://hellot.nekoweb.org/assets/deez.png" style="width:20px; vertical-align:middle;">
            </h5><br>
            • <a href="https://mii-unsecure.ariankordi.net">Mii Renderer (REAL)</a> for the Mii Renders<br>
            <button onclick="document.getElementById('mp2').style.display='none'"
                    style="margin-top:10px; padding:6px 14px; background:#222; color:#fff; border:1px solid #444; border-radius:6px; cursor:pointer;">
                ※ Close ※
            </button>
        </div>
    `;
}
// explains why is there a pants value on CHARINFO miis
function sp() {
	document.getElementById("mp1").style.display = "flex";
	document.getElementById("pt").innerHTML = `
        <div style="font-size:14px; text-align:left; padding:8px;">
            You may be wondering why is there a "Type" value on CHARINFO Miis...<br><br>
            Well, you see, charinfo has a normal pants and special pants state that still exists to this day.<br>
            <i>(Which you can get by hex editing any charinfo Mii!)</i><br>
            Here are some HEX codes for CHARINFO files to edit the pants value:<br>
            (You need to figure out where's the pants value)<br><br>
            <code>00</code> = Normal<br>
            <code>01</code> = Special<br><br>
            Here is some charinfo examples that are special Miis that you can download:<br>
            <a href="https://helloiti.github.io/mii/Gold_Male.charinfo">※ Example 1 ※</a><br>
            <a href="https://helloiti.github.io/mii/Gold_Girl.charinfo">※ Example 2 ※</a><br><br>
            <i><b>Note:</b></i> <i>These examples WON'T work on real Nintendo Switches, they work on this tool (that you are currently using right now), <a href="https://mii-unsecure.ariankordi.net">Mii Renderer (REAL)</a></i><br>
            <i>(won't show up the special pants as long you render the Mii's pants to "Gold") and <a href="https://mii.nxw.pw">Mii Creator</a></i><br>
            <i>(The special pants will also not show up, but as long you set the Mii's type to "Special")</i><br><br>
            <button onclick="cp()" style="margin-top:5px; padding:5px 12px; background:#222; color:white; border:1px solid #444;">
                ※ Close ※
            </button>
        </div>
    `;
}
function cp() { document.getElementById("mp1").style.display = "none"; }
// hi
const ca = [
	{ off: 16, len: 22, name: "Nickname", type: "utf16" },
	{ off: 40, name: "Gender", type: "u8" },
	{ off: 39, name: "Favorite Color", type: "u8" },
	{ off: 43, name: "Type", type: "u8" },
	{ off: 41, name: "Height", type: "u8" },
	{ off: 42, name: "Weight", type: "u8" },
];
const fc = ["Red","Orange","Yellow","Green","Lime Green","Blue","Light Blue","Pink","Purple","Brown","White","Black"];
// pants/type
const pt = { 0: "Normal", 1: "Special" };
// ok
const ft = { charinfo: ".charinfo", ffsd: ".ffsd" };
function hb(hx) {
	return new Uint8Array(hx.match(/.{2}/g).map((b) => parseInt(b, 16)));
}
function sl() {
	const st = ls.map((m) => ({ id: m.id, dataHex: m.dataHex, ext: m.ext }));
	localStorage.setItem("miis", JSON.stringify(st));
}
function b64ToHex(b64) {
	const binary = atob(b64);
	let hex = "";
	for (let i = 0; i < binary.length; i++) {
		hex += binary.charCodeAt(i).toString(16).padStart(2, "0");
	}
	return hex;
}
function normalizeInput(raw) {
	const trimmed = raw.trim().replace(/\s+/g, "");
	if (!trimmed) return { hex: null, error: "Please type a valid Mii HEX data or Base64 data." };
	if (/^[0-9a-fA-F]+$/.test(trimmed)) {
		if (trimmed.length % 2 !== 0) return { hex: null, error: "HEX length must be even!" };
		return { hex: trimmed.toLowerCase(), error: null };
	}
	if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
		try {
			const hex = b64ToHex(trimmed);
			return { hex, error: null };
		} catch (e) {
			return { hex: null, error: "Invalid Base64 data!" };
		}
	}

	return { hex: null, error: "Invalid CHARINFO/FFSD HEX or Base64 data!" };
}
// checks if the hex text data of the mii is valid or not!!!
document.getElementById("ih").onclick = () => {
	const raw = document.getElementById("hx").value;
	if (!raw.trim()) return alert("Please type a valid Mii HEX or Base64 data.");

	const { hex: hx, error } = normalizeInput(raw);
	if (error) return alert(error);

	const bl = hx.length / 2;
	if (bl !== 88 && bl !== 96)
		return alert("Mii Storage doesn't support Mii Studio HEX data, only FFSD and CHARINFO.");

	let ex = bl === 88 ? "charinfo" : "ffsd";
	const bf = new Uint8Array(hx.match(/.{2}/g).map((b) => parseInt(b, 16)));
	ls.push({ id: Date.now(), data: bf, dataHex: hx, ext: ex });
	sl();
	rd();
	document.getElementById("hx").value = "";
};

// checks if the user has imported a valid charinfo or ffsd mii file
document.getElementById("fl").onchange = async (e) => {
	const f = e.target.files[0];
	if (!f) return;
	const ex = f.name.split(".").pop().toLowerCase();
	if (ex !== "charinfo" && ex !== "ffsd")
		return alert("Please use .charinfo or .ffsd Mii files only!");
	const bf = new Uint8Array(await f.arrayBuffer());
	const hx = Array.from(bf)
		.map((x) => x.toString(16).padStart(2, "0"))
		.join("");
	ls.push({ id: Date.now(), data: bf, dataHex: hx, ext: ex });
	sl();
	rd();
};
// the stuff.
function pm(bf, ex) {
	const ifo = {};
	const dc = new TextDecoder("utf-16le");
	ifo["File Type"] = ft[ex] || ex;
	if (ex === "charinfo") {
		ca.forEach((a) => {
			if (a.type === "utf16") {
				ifo[a.name] = dc
					.decode(bf.slice(a.off, a.off + a.len))
					.replace(/\0/g, "")
					.trim();
			} else {
				ifo[a.name] = bf[a.off];
			}
		});
		ifo["Favorite Color"] = fc[ifo["Favorite Color"]] || "Unknown";
		ifo["Gender"] = ifo["Gender"] === 0 ? "Male" : "Female";
		ifo["Type"] = pt[ifo["Type"]] || "Unknown";
		if (!ifo["Nickname"]) ifo["Nickname"] = "Mii";
	} else if (ex === "ffsd") {
		ifo["Nickname"] =
			dc.decode(bf.slice(0x1a, 0x1a + 20)).replace(/\0/g, "").trim() || "Mii";
		ifo["Creator's Name"] =
			dc.decode(bf.slice(0x48, 0x48 + 20)).replace(/\0/g, "").trim() || "Unknown";
		ifo["Height"] = bf[0x2e];
		ifo["Weight"] = bf[0x2f];
		const mb = (bf[0x19] << 8) | bf[0x18];
		const gb = mb & 0x01;
		ifo["Gender"] = gb === 0 ? "Male" : "Female";
		const ci = (mb >> 10) & 0x0f;
		ifo["Favorite Color"] = fc[ci] || "Unknown";
		const isSpecial = (bf[0x0c] & 0x80) === 0;
		const isFavorite = (bf[0x19] & 0x40) !== 0;
		if (isSpecial) {
			ifo["Type"] = "Special";
		} else if (isFavorite) {
			ifo["Type"] = "Favorite";
		} else {
			ifo["Type"] = "Normal";
		}
	}
	return ifo;
}
// saves the imported miis into your browser's local storage!!
let ls = [];
try {
	const raw = JSON.parse(localStorage.getItem("miis") || "[]");
	if (Array.isArray(raw)) {
		ls = raw
			.filter((m) => m && m.dataHex && m.ext)
			.map((m) => ({
				id: m.id || Date.now() + Math.random(),
				dataHex: m.dataHex,
				ext: m.ext,
				data: hb(m.dataHex),
			}));
	}
} catch (e) {
	console.warn("localStorage 'miis' is corrupted... removing it!");
	localStorage.removeItem("miis");
	ls = [];
}
// the mii renders (credits to ariankordi for the mii renders!!!)
function rd() {
	const wp = document.getElementById("ls");
	wp.innerHTML = "";
	ls.forEach((m) => {
		const ifo = pm(m.data, m.ext);
		const dv = document.createElement("div");
		dv.className = "cd";
		const pp =
			m.ext === "charinfo" && ifo["Type"] === "Special" ? "gold" : "gray";
		const fp =
			ifo["Type"] === "Special" ? "gold" : ifo["Type"] === "Favorite" ? "red" : "gray";
		const cf = `https://mii-unsecure.ariankordi.net/miis/image.png?erri=s4mwu-rs1&data=${m.dataHex}&shaderType=switch&type=face&width=270&pantsColor=${pp}&bodyType=switch&verifyCharInfo=0`;
		const cb = `https://mii-unsecure.ariankordi.net/miis/image.png?erri=s4mwu-rs1&data=${m.dataHex}&shaderType=switch&type=all_body_sugar&width=270&pantsColor=${pp}&bodyType=switch&verifyCharInfo=0`;
		const ff = `https://mii-unsecure.ariankordi.net/miis/image.png?data=${m.dataHex}&type=face&width=270&pantsColor=gray&bodyType=wiiu&verifyCharInfo=0`;
		const fb = `https://mii-unsecure.ariankordi.net/miis/image.png?erri=s6s37-r99&data=${m.dataHex}&type=all_body_sugar&width=270&pantsColor=${fp}&verifyCharInfo=0`;
		const fu = m.ext === "charinfo" ? cf : ff;
		const bu = m.ext === "charinfo" ? cb : fb;
		const im = document.createElement("img");
		im.src = fu;
		im.onclick = () => {
			document.getElementById("pi").src = bu;
			document.getElementById("mp").style.display = "flex";
		};
		// adds a little star next to the mii's nickname if its a special charinfo mii, or a little heart if its a favorite ffsd mii!
		const mt = document.createElement("div");
		const gb =
			(m.ext === "charinfo" && ifo["Type"] === "Special") ||
			(m.ext === "ffsd" && ifo["Type"] === "Special")
				? " ⭐"
				: m.ext === "ffsd" && ifo["Type"] === "Favorite"
					? " ♥️"
					: "";
		let t = "<table><tr><th>Attribute</th><th>Value</th></tr>";
		for (const k in ifo) {
			if (m.ext === "charinfo" && k === "Creator's Name") continue;
			t += `<tr><td>${k}</td><td>${ifo[k]}</td></tr>`;
		}
		t += "</table>";
		const pi =
			m.ext === "charinfo"
				? `<button style="background:#222; color:#fff; border:1px solid #555; cursor:pointer; padding:2px 6px; border-radius:6px; font-size:12px;" onclick="sp()">?</button>`
				: "";
		mt.innerHTML =
			`<div style="font-weight:600">${ifo["Nickname"]}${gb} ${pi}</div>` + t;
		// downloads the saved mii back as a real .charinfo/.ffsd file
		const dw = document.createElement("button");
		dw.textContent = "※ Download ※";
		dw.style.cssText =
			"background:#222; color:#fff; border:1px solid #444; cursor:pointer; padding:4px 8px; border-radius:6px; font-size:12px;";
		dw.onclick = () => {
			const blob = new Blob([m.data], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const nick = (ifo["Nickname"] || "Mii").replace(/[^a-zA-Z0-9_-]/g, "_");
			a.download = `${nick}.${m.ext}`;
			a.click();
			URL.revokeObjectURL(url);
		};
		const dl = document.createElement("button");
		dl.textContent = "※ Remove ※";
		dl.style.cssText =
			"background:#c33; color:#fff; border:1px solid #a00; cursor:pointer; padding:4px 8px; border-radius:6px; font-size:12px;";
		dl.onclick = () => {
			ls = ls.filter((x) => x.id !== m.id);
			sl();
			rd();
		};
		dv.append(im, mt, dw, dl);
		wp.append(dv);
	});
}
// The End. \\
rd();
// The End. \\
