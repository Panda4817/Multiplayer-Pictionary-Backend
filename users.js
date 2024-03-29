import Filter from "bad-words";

const filter = new Filter();
const users = [];
const emojiList = [
	"0x1F600",
	"0x1F603",
	"0x1F604",
	"0x1F601",
	"0x1F606",
	"0x1F605",
	"0x1F923",
	"0x1F602",
	"0x1F642",
	"0x1F643",
	"0x1F609",
	"0x1F60A",
	"0x1F607",
	"0x1F970",
	"0x1F60D",
	"0x1F929",
	"0x1F618",
	"0x1F617",
	"0x1F61A",
	"0x1F619",
	"0x1F60B",
	"0x1F61B",
	"0x1F61C",
	"0x1F92A",
	"0x1F61D",
	"0x1F911",
	"0x1F917",
	"0x1F92D",
	"0x1F92B",
	"0x1F914",
	"0x1F910",
	"0x1F928",
	"0x1F610",
	"0x1F611",
	"0x1F636",
	"0x1F60F",
	"0x1F612",
	"0x1F644",
	"0x1F62C",
	"0x1F925",
	"0x1F60C",
	"0x1F614",
	"0x1F62A",
	"0x1F924",
	"0x1F634",
	"0x1F637",
	"0x1F912",
	"0x1F915",
	"0x1F922",
	"0x1F92E",
	"0x1F927",
	"0x1F975",
	"0x1F976",
	"0x1F974",
	"0x1F635",
	"0x1F92F",
	"0x1F920",
	"0x1F973",
	"0x1F60E",
	"0x1F913",
	"0x1F9D0",
	"0x1F615",
	"0x1F61F",
	"0x1F641",
	"0x2639",
	"0x1F62E",
	"0x1F62F",
	"0x1F632",
	"0x1F633",
	"0x1F97A",
	"0x1F626",
	"0x1F627",
	"0x1F628",
	"0x1F630",
	"0x1F625",
	"0x1F622",
	"0x1F62D",
	"0x1F631",
	"0x1F616",
	"0x1F623",
	"0x1F61E",
	"0x1F613",
	"0x1F629",
	"0x1F62B",
	"0x1F971",
	"0x1F624",
	"0x1F621",
	"0x1F620",
	"0x1F92C",
	"0x1F608",
	"0x1F47F",
	"0x1F480",
	"0x2620",
	"0x1F4A9",
	"0x1F921",
	"0x1F479",
	"0x1F47A",
	"0x1F47B",
	"0x1F47D",
	"0x1F47E",
	"0x1F916",
	"0x1F63A",
	"0x1F638",
	"0x1F639",
	"0x1F63B",
	"0x1F63C",
	"0x1F63D",
	"0x1F640",
	"0x1F63F",
	"0x1F63E",
	"0x1F648",
	"0x1F649",
	"0x1F64A",
	"0x1F476",
	"0x1F9D2",
	"0x1F466",
	"0x1F467",
	"0x1F9D1",
	"0x1F471",
	"0x1F468",
	"0x1F9D4",
	"0x1F9D3",
	"0x1F474",
	"0x1F475",
	"0x1F46E",
	"0x1F575",
	"0x1F482",
	"0x1F477",
	"0x1F934",
	"0x1F478",
	"0x1F473",
	"0x1F472",
	"0x1F9D5",
	"0x1F935",
	"0x1F470",
	"0x1F47C",
	"0x1F385",
	"0x1F936",
	"0x1F9B8",
	"0x1F9B9",
	"0x1F9D9",
	"0x1F9DA",
	"0x1F9DB",
	"0x1F9DC",
	"0x1F9DD",
	"0x1F9DE",
	"0x1F9DF",
	"0x1F435",
	"0x1F412",
	"0x1F98D",
	"0x1F9A7",
	"0x1F436",
	"0x1F415",
	"0x1F9AE",
	"0x1F429",
	"0x1F43A",
	"0x1F98A",
	"0x1F99D",
	"0x1F431",
	"0x1F408",
	"0x1F981",
	"0x1F42F",
	"0x1F405",
	"0x1F406",
	"0x1F434",
	"0x1F40E",
	"0x1F984",
	"0x1F993",
	"0x1F98C",
	"0x1F42E",
	"0x1F402",
	"0x1F403",
	"0x1F404",
	"0x1F437",
	"0x1F416",
	"0x1F417",
	"0x1F43D",
	"0x1F40F",
	"0x1F411",
	"0x1F410",
	"0x1F42A",
	"0x1F42B",
	"0x1F999",
	"0x1F992",
	"0x1F418",
	"0x1F98F",
	"0x1F99B",
	"0x1F42D",
	"0x1F401",
	"0x1F400",
	"0x1F439",
	"0x1F430",
	"0x1F407",
	"0x1F43F",
	"0x1F994",
	"0x1F987",
	"0x1F43B",
	"0x1F428",
	"0x1F43C",
	"0x1F9A5",
	"0x1F9A6",
	"0x1F9A8",
	"0x1F998",
	"0x1F9A1",
	"0x1F43E",
	"0x1F983",
	"0x1F414",
	"0x1F413",
	"0x1F423",
	"0x1F424",
	"0x1F425",
	"0x1F426",
	"0x1F427",
	"0x1F54A",
	"0x1F985",
	"0x1F986",
	"0x1F9A2",
	"0x1F989",
	"0x1F9A9",
	"0x1F99A",
	"0x1F99C",
	"0x1F438",
	"0x1F40A",
	"0x1F422",
	"0x1F98E",
	"0x1F40D",
	"0x1F432",
	"0x1F409",
	"0x1F995",
	"0x1F996",
	"0x1F433",
	"0x1F40B",
	"0x1F42C",
	"0x1F41F",
	"0x1F420",
	"0x1F421",
	"0x1F988",
	"0x1F419",
	"0x1F41A",
	"0x1F40C",
	"0x1F98B",
	"0x1F41B",
	"0x1F41C",
	"0x1F41D",
	"0x1F41E",
	"0x1F997",
	"0x1F577",
	"0x1F578",
	"0x1F982",
	"0x1F99F",
	"0x1F9A0",
	"0x1F490",
	"0x1F338",
	"0x1F4AE",
	"0x1F3F5",
	"0x1F339",
	"0x1F940",
	"0x1F33A",
	"0x1F33B",
	"0x1F33C",
	"0x1F337",
	"0x1F331",
	"0x1F332",
	"0x1F333",
	"0x1F334",
	"0x1F335",
	"0x1F33E",
	"0x1F33F",
	"0x2618",
	"0x1F340",
	"0x1F341",
	"0x1F342",
	"0x1F343",
	"0x1F347",
	"0x1F348",
	"0x1F349",
	"0x1F34A",
	"0x1F34B",
	"0x1F34C",
	"0x1F34D",
	"0x1F96D",
	"0x1F34E",
	"0x1F34F",
	"0x1F350",
	"0x1F351",
	"0x1F352",
	"0x1F353",
	"0x1F95D",
	"0x1F345",
	"0x1F965",
	"0x1F951",
	"0x1F346",
	"0x1F954",
	"0x1F955",
	"0x1F33D",
	"0x1F336",
	"0x1F952",
	"0x1F96C",
	"0x1F966",
	"0x1F9C4",
	"0x1F9C5",
	"0x1F344",
	"0x1F95C",
	"0x1F330",
	"0x1F35E",
	"0x1F950",
	"0x1F956",
	"0x1F968",
	"0x1F96F",
	"0x1F95E",
	"0x1F9C7",
	"0x1F9C0",
	"0x1F356",
	"0x1F357",
	"0x1F969",
	"0x1F953",
	"0x1F354",
	"0x1F35F",
	"0x1F355",
	"0x1F32D",
	"0x1F96A",
	"0x1F32E",
	"0x1F32F",
	"0x1F959",
	"0x1F9C6",
	"0x1F95A",
	"0x1F373",
	"0x1F958",
	"0x1F372",
	"0x1F963",
	"0x1F957",
	"0x1F37F",
	"0x1F9C8",
	"0x1F9C2",
	"0x1F96B",
	"0x1F371",
	"0x1F358",
	"0x1F359",
	"0x1F35A",
	"0x1F35B",
	"0x1F35C",
	"0x1F35D",
	"0x1F360",
	"0x1F362",
	"0x1F363",
	"0x1F364",
	"0x1F365",
	"0x1F96E",
	"0x1F361",
	"0x1F95F",
	"0x1F960",
	"0x1F961",
	"0x1F980",
	"0x1F99E",
	"0x1F990",
	"0x1F991",
	"0x1F9AA",
	"0x1F366",
	"0x1F367",
	"0x1F368",
	"0x1F369",
	"0x1F36A",
	"0x1F382",
	"0x1F370",
	"0x1F9C1",
	"0x1F967",
	"0x1F36B",
	"0x1F36C",
	"0x1F36D",
	"0x1F36E",
	"0x1F36F",
	"0x1F37C",
	"0x1F95B",
	"0x2615",
	"0x1F375",
	"0x1F376",
	"0x1F37E",
	"0x1F377",
	"0x1F378",
	"0x1F379",
	"0x1F37A",
	"0x1F37B",
	"0x1F942",
	"0x1F943",
	"0x1F964",
	"0x2603",
	"0x26C4",
];

// Function to add a user to users lists
export const addUser = ({ id, name, room, avatar }) => {
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();

	if (name === "" || room === "") {
		return { error: `Username and/or room name is empty` };
	}

	const sanitizedName = name.replace(/[^A-Za-z0-9]/g,"");
	const sanitizedRoom = room.replace(/[^A-Za-z0-9-]/g,"");

	if (sanitizedName !== name || sanitizedRoom !== room) {
		return { error: `Username and/or room name contain invalid characters` };
	}

	const cleanName = filter.clean(sanitizedName);
	const cleanRoom = filter.clean(sanitizedRoom);

	if (name !== cleanName || room !== cleanRoom) {
		return { error: `Ensure username and/or room name is clean` };
	}

	const existingUser = users.find((user) => user.room === room && user.name === name);

	if (existingUser) {
		return { error: `Username is taken in room ${room}` };
	}

	if (name.length > 12) {
		return { error: `Username is too long` };
	}

	if (room.length > 150) {
		return { error: `Room name is too long` };
	}

	if (emojiList.find((hexCode) => hexCode === avatar) === undefined) {
		avatar = "";
	}

	const turn = false;
	const hadPoints = false;
	const points = 0;
	const user = { id, name, room, avatar, turn, points, hadPoints };

	users.push(user);

	return { user };
};

// Update user
export const updateUser = ({ id, name, room, avatar }) => {
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();

	if (room.length > 150 || room == "") {
		return {
			error: `Room name cannot be updated in the waiting room (Close the window and join a new room)`,
		};
	}

	if (name === "") {
		return { error: `Username is empty` };
	}

	let cleanName = filter.clean(name);
	let cleanRoom = filter.clean(room);

	if (name !== cleanName || room !== cleanRoom) {
		return { error: `Ensure username and/or room name is clean` };
	}

	const existingUser = users.find((user) => user.room === room && user.name === name);

	if (existingUser) {
		return { error: `Username is taken in room ${room}` };
	}

	if (name.length > 12) {
		return { error: `Username is too long (max 12 characters)` };
	}

	if (emojiList.find((hexCode) => hexCode === avatar) === undefined) {
		avatar = "";
	}

	const turn = false;
	const hadPoints = false;
	const points = 0;
	const user = { id, name, room, avatar, turn, points, hadPoints };

	users.push(user);

	return { user };
};

// A function to change turn property of user (so every player in a room gets one turn each per round)
export const changeTurn = (id, bool) => {
	const index = users.findIndex((user) => user.id === id);
	const user = users[index];
	user.turn = bool;
	users[index] = user;
	return;
};

// A function to remove a user when user leaves room
export const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

// A function to get user with id
export const getUser = (id) => users.find((user) => user.id === id);

// A function to get all players in a room
export const getUsersInRoom = (room) => users.filter((user) => user.room === room);

// A function to add points to a user
export const addPoint = (id, point) => {
	const index = users.findIndex((user) => user.id === id);
	const user = users[index];
	user.points += point;
	users[index] = user;
	return;
};

// A function to reset points to 0 for a user
export const resetPoint = (id) => {
	const index = users.findIndex((user) => user.id === id);
	const user = users[index];
	user.points = 0;
	user.hadPoints = false;
	users[index] = user;
	return;
};

// A function to change hadPoints property (so users cannot keep getting points when guessed right)
export const changeHadPoints = (id) => {
	const index = users.findIndex((user) => user.id === id);
	const user = users[index];
	user.hadPoints = true;
	users[index] = user;
	return;
};

// A function to change hadPoints property to false when new game started
export const resetHadPoints = (id) => {
	const index = users.findIndex((user) => user.id === id);
	const user = users[index];
	user.hadPoints = false;
	users[index] = user;
	return;
};

// A function to handle resetting points for each player in the room
export const resetPoints = (room) => {
	const usersList = getUsersInRoom(room);
	usersList.map((user) => resetPoint(user.id));
	return;
};

// A function to reset the hadPoints property for each user
export const resetPlayerHadPoints = (room) => {
	const usersList = getUsersInRoom(room);
	usersList.map((user) => resetHadPoints(user.id));
	return;
};

// A function to handle changing turn property for each user in the room
export const resetPlayerTurns = (room) => {
	const usersList = getUsersInRoom(room);
	usersList.map((u) => changeTurn(u.id, false));
	return;
};
