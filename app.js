/* =========================================================
   TOURNAMENT BRS — TOURNAMENT ENGINE
========================================================= */

const STORAGE_KEY = "TOURNAMENT_BRS_DATABASE_V4";

let database = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "{}"
);

let state = {
    currentMode: null,
    currentTournament: null,
    currentTab: null,
    setupTeams: []
};


/* =========================================================
   STORAGE
========================================================= */

function saveDatabase() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}


function showScreen(id) {

    document.querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.remove("active");
        });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function shuffle(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [copy[i], copy[j]] = [
            copy[j],
            copy[i]
        ];
    }

    return copy;
}


function createID(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


/* =========================================================
   HOME
========================================================= */

function goHome() {

    state.currentMode = null;
    state.currentTournament = null;
    state.currentTab = null;

    showScreen("homeScreen");

    renderSavedTournaments();
}


/* =========================================================
   MODE START
========================================================= */

function startMode(mode) {

    state.currentMode = mode;

    state.setupTeams = [];

    document.getElementById("tourName").value = "";

    const title =
        document.getElementById("setupTitle");

    const desc =
        document.getElementById("setupDesc");

    if (mode === "knockout") {

        title.textContent =
            "إعداد الأدوار الإقصائية";

        desc.textContent =
            "اختر حجم الـBracket واترك النظام يكمل الخانات الناقصة بـ BOT.";

    } else if (mode === "ucl") {

        title.textContent =
            "إعداد دوري المجموعات";

        desc.textContent =
            "حدد عدد المجموعات وحجم كل مجموعة وعدد المتأهلين.";

    } else {

        title.textContent =
            "إعداد الدوري";

        desc.textContent =
            "أضف أي عدد من الفرق وحدد نظام النقاط والمباريات.";
    }

    renderSetupOptions(mode);
    renderTeamsList();

    showScreen("setupScreen");
}


/* =========================================================
   SETUP OPTIONS
========================================================= */

function renderSetupOptions(mode) {

    const box =
        document.getElementById("setupOptions");

    if (!box) return;

    if (mode === "knockout") {

        box.innerHTML = `

            <div class="option-card">

                <label>
                    حجم الدور
                </label>

                <select id="koSize">

                    <option value="2">دور 2</option>
                    <option value="4">دور 4</option>
                    <option value="8">دور 8</option>
                    <option value="16" selected>دور 16</option>
                    <option value="32">دور 32</option>
                    <option value="64">دور 64</option>

                </select>

            </div>


            <div class="option-card">

                <label>
                    نظام المباراة
                </label>

                <select id="koLegs">

                    <option value="1" selected>
                        مباراة واحدة
                    </option>

                    <option value="2">
                        ذهاب وإياب
                    </option>

                </select>

            </div>

        `;

        return;
    }


    if (mode === "ucl") {

        box.innerHTML = `

            <div class="option-card">

                <label>
                    عدد المجموعات
                </label>

                <input
                    id="groupCount"
                    type="number"
                    min="1"
                    max="32"
                    value="4"
                    class="input"
                >

            </div>


            <div class="option-card">

                <label>
                    عدد الفرق في المجموعة
                </label>

                <input
                    id="teamsPerGroup"
                    type="number"
                    min="2"
                    max="32"
                    value="4"
                    class="input"
                >

            </div>


            <div class="option-card">

                <label>
                    المتأهلون من كل مجموعة
                </label>

                <input
                    id="qualifyCount"
                    type="number"
                    min="1"
                    max="32"
                    value="2"
                    class="input"
                >

            </div>


            <div class="option-card">

                <label>
                    مباريات المجموعة
                </label>

                <select id="groupLegs">

                    <option value="1" selected>
                        مباراة واحدة
                    </option>

                    <option value="2">
                        ذهاب وإياب
                    </option>

                </select>

            </div>

        `;

        return;
    }


    box.innerHTML = `

        <div class="option-card">

            <label>
                مباريات الدوري
            </label>

            <select id="leagueLegs">

                <option value="1" selected>
                    مباراة واحدة
                </option>

                <option value="2">
                    ذهاب وإياب
                </option>

            </select>

        </div>


        <div class="option-card">

            <label>
                نقاط الفوز
            </label>

            <input
                id="winPoints"
                type="number"
                min="0"
                value="3"
                class="input"
            >

        </div>


        <div class="option-card">

            <label>
                نقاط التعادل
            </label>

            <input
                id="drawPoints"
                type="number"
                min="0"
                value="1"
                class="input"
            >

        </div>

    `;
}


/* =========================================================
   TEAM MANAGEMENT
========================================================= */

function addTeam() {

    const input =
        document.getElementById("teamInput");

    if (!input) return;

    const name =
        input.value.trim();

    if (!name) {

        showToast(
            "اكتب اسم الفريق أولاً."
        );

        input.focus();

        return;
    }


    const exists =
        state.setupTeams.some(
            team =>
                team.toLowerCase() ===
                name.toLowerCase()
        );

    if (exists) {

        showToast(
            "هذا الفريق موجود بالفعل."
        );

        input.focus();

        return;
    }


    state.setupTeams.push(name);

    input.value = "";

    renderTeamsList();

    input.focus();
}


function removeTeam(index) {

    if (
        index < 0 ||
        index >= state.setupTeams.length
    ) {
        return;
    }

    state.setupTeams.splice(index, 1);

    renderTeamsList();
}


function renderTeamsList() {

    const list =
        document.getElementById("teamsList");

    const empty =
        document.getElementById("teamsEmpty");

    const counter =
        document.getElementById("teamCounter");

    if (!list) return;


    counter.textContent =
        `${state.setupTeams.length} فريق`;


    if (state.setupTeams.length === 0) {

        list.innerHTML = "";

        empty.classList.remove("hidden");

        return;
    }


    empty.classList.add("hidden");


    list.innerHTML =
        state.setupTeams
            .map((team, index) => `

                <div class="team-item">

                    <div class="team-index">
                        ${index + 1}
                    </div>

                    <div class="team-name">
                        ${escapeHTML(team)}
                    </div>

                    <button
                        type="button"
                        class="remove-team"
                        onclick="removeTeam(${index})"
                        aria-label="حذف الفريق"
                    >

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M6 6L18 18M18 6L6 18"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                            />

                        </svg>

                    </button>

                </div>

            `)
            .join("");
}


/* =========================================================
   CREATE TOURNAMENT
========================================================= */

function createTournament() {

    const nameInput =
        document.getElementById("tourName");

    const name =
        nameInput.value.trim() ||
        "بطولة بدون اسم";


    if (state.setupTeams.length < 1) {

        showToast(
            "أضف فريقًا واحدًا على الأقل."
        );

        return;
    }


    const teams = [
        ...state.setupTeams
    ];


    const tournament = {

        id: createID("tour"),

        name,

        mode: state.currentMode,

        teams,

        createdAt: Date.now(),

        data: {}

    };


    if (state.currentMode === "knockout") {

        initializeKnockout(
            tournament
        );

    } else if (state.currentMode === "ucl") {

        initializeChampionsFormat(
            tournament
        );

    } else {

        initializeLeague(
            tournament
        );
    }


    database[tournament.id] =
        tournament;

    saveDatabase();

    openTournament(
        tournament.id
    );

    showToast(
        "تم إنشاء البطولة بنجاح."
    );
}


/* =========================================================
   KNOCKOUT
========================================================= */

function getNextPowerOfTwo(number) {

    let result = 1;

    while (result < number) {
        result *= 2;
    }

    return result;
}


function createBots(count, start = 1) {

    const bots = [];

    for (
        let i = 0;
        i < count;
        i++
    ) {

        bots.push({
            name: `BOT ${start + i}`,
            isBot: true
        });

    }

    return bots;
}


function normalizeParticipants(
    teams,
    targetSize
) {

    const shuffled =
        shuffle(
            teams.map(name => ({
                name,
                isBot: false
            }))
        );


    const missing =
        Math.max(
            0,
            targetSize - shuffled.length
        );


    const bots =
        createBots(
            missing
        );


    return shuffle([
        ...shuffled,
        ...bots
    ]);
}


function initializeKnockout(
    tournament
) {

    const sizeInput =
        document.getElementById(
            "koSize"
        );

    const legsInput =
        document.getElementById(
            "koLegs"
        );


    let requestedSize =
        Number(
            sizeInput?.value || 16
        );


    if (
        !Number.isFinite(
            requestedSize
        ) ||
        requestedSize < 2
    ) {
        requestedSize = 16;
    }


    const validSizes = [
        2,
        4,
        8,
        16,
        32,
        64
    ];


    if (
        !validSizes.includes(
            requestedSize
        )
    ) {

        requestedSize =
            getNextPowerOfTwo(
                requestedSize
            );
    }


    const legs =
        Number(
            legsInput?.value || 1
        );


    const participants =
        normalizeParticipants(
            tournament.teams,
            requestedSize
        );


    tournament.data = {

        type: "knockout",

        size: requestedSize,

        legs:
            legs === 2 ? 2 : 1,

        rounds: [],

        champion: null

    };


    createKnockoutRound(
        tournament,
        participants,
        1
    );


    /*
       BOT vs TEAM:
       إذا كانت المباراة BOT ضد فريق،
       نقدر نخلي المستخدم هو الذي يحدد الفائز.
       لن يتم اختيار الفائز تلقائياً.
    */
}


function createKnockoutRound(
    tournament,
    participants,
    roundNumber
) {

    const matches = [];


    for (
        let i = 0;
        i < participants.length;
        i += 2
    ) {

        const home =
            participants[i];

        const away =
            participants[i + 1];


        matches.push({

            id: createID("match"),

            home: home.name,

            away: away.name,

            homeIsBot:
                Boolean(home.isBot),

            awayIsBot:
                Boolean(away.isBot),

            homeScore: null,

            awayScore: null,

            winner: null,

            played: false

        });
    }


    tournament.data.rounds.push({

        number: roundNumber,

        matches

    });
}


/* =========================================================
   MANUAL WINNER
========================================================= */

function chooseKnockoutWinner(
    matchID,
    winner
) {

    const tournament =
        state.currentTournament;

    if (!tournament) return;


    const rounds =
        tournament.data.rounds;


    let match = null;


    for (
        const round of rounds
    ) {

        const found =
            round.matches.find(
                item =>
                    item.id === matchID
            );

        if (found) {

            match = found;

            break;
        }
    }


    if (!match) return;


    if (
        winner !== match.home &&
        winner !== match.away
    ) {
        return;
    }


    match.winner =
        winner;

    match.played = true;


    saveCurrentTournament();

    renderTournament();

    showToast(
        `تم اختيار ${winner} كفائز.`
    );
}


/* =========================================================
   ADVANCE KNOCKOUT
========================================================= */

function advanceKnockout() {

    const tournament =
        state.currentTournament;

    if (!tournament) return;


    const rounds =
        tournament.data.rounds;


    const currentRound =
        rounds[rounds.length - 1];


    if (!currentRound) return;


    const unfinished =
        currentRound.matches.some(
            match =>
                !match.winner
        );


    if (unfinished) {

        showToast(
            "حدد الفائز في كل مباراة أولاً."
        );

        return;
    }


    const winners =
        currentRound.matches.map(
            match =>
                match.winner
        );


    if (winners.length === 1) {

        tournament.data.champion =
            winners[0];

        saveCurrentTournament();

        renderTournament();

        showToast(
            "تم تحديد بطل البطولة."
        );

        return;
    }


    const shuffledWinners =
        shuffle(winners)
            .map(name => ({
                name,
                isBot:
                    String(name)
                        .startsWith("BOT ")
            }));


    createKnockoutRound(
        tournament,
        shuffledWinners,
        currentRound.number + 1
    );


    saveCurrentTournament();

    renderTournament();
}


/* =========================================================
   LEAGUE
========================================================= */

function generateRoundRobin(
    teams,
    legs = 1,
    prefix = "match"
) {

    let list = [...teams];

    if (list.length < 2) {
        return [];
    }


    if (list.length % 2 !== 0) {
        list.push(null);
    }


    const n = list.length;

    const rounds = n - 1;

    const matches = [];


    for (
        let round = 0;
        round < rounds;
        round++
    ) {

        for (
            let i = 0;
            i < n / 2;
            i++
        ) {

            const home =
                list[i];

            const away =
                list[n - 1 - i];


            if (
                home === null ||
                away === null
            ) {
                continue;
            }


            matches.push({

                id: createID(prefix),

                round:
                    round + 1,

                home,

                away,

                homeScore: null,

                awayScore: null,

                played: false

            });
        }


        const fixed =
            list[0];

        const rest =
            list.slice(1);

        rest.unshift(
            rest.pop()
        );

        list = [
            fixed,
            ...rest
        ];
    }


    if (legs === 2) {

        const firstLeg =
            matches.map(
                match => ({
                    ...match,

                    id: createID(prefix),

                    home:
                        match.away,

                    away:
                        match.home,

                    homeScore: null,

                    awayScore: null,

                    played: false,

                    round:
                        match.round +
                        rounds

                })
            );


        matches.push(
            ...firstLeg
        );
    }


    return matches;
}


function initializeLeague(
    tournament
) {

    const legs =
        Number(
            document.getElementById(
                "leagueLegs"
            )?.value || 1
        );


    const winPoints =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "winPoints"
                )?.value || 3
            )
        );


    const drawPoints =
        Math.max(
            0,
            Number(
                document.getElementById(
                    "drawPoints"
                )?.value || 1
            )
        );


    tournament.data = {

        type: "league",

        legs:
            legs === 2 ? 2 : 1,

        winPoints,

        drawPoints,

        matches:
            generateRoundRobin(
                tournament.teams,
                legs,
                "league"
            )

    };
}


function calculateTable(
    tournament
) {

    const teams =
        tournament.teams;

    const matches =
        tournament.data.matches;


    const table = {};


    teams.forEach(team => {

        table[team] = {

            team,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            gf: 0,

            ga: 0,

            points: 0

        };

    });


    matches.forEach(match => {

        if (
            !match.played ||
            match.homeScore === null ||
            match.awayScore === null
        ) {
            return;
        }


        const home =
            table[match.home];

        const away =
            table[match.away];


        if (!home || !away) return;


        home.played++;
        away.played++;


        home.gf +=
            Number(match.homeScore);

        home.ga +=
            Number(match.awayScore);


        away.gf +=
            Number(match.awayScore);

        away.ga +=
            Number(match.homeScore);


        if (
            match.homeScore >
            match.awayScore
        ) {

            home.wins++;

            away.losses++;

            home.points +=
                tournament.data.winPoints;

        } else if (
            match.homeScore <
            match.awayScore
        ) {

            away.wins++;

            home.losses++;

            away.points +=
                tournament.data.winPoints;

        } else {

            home.draws++;

            away.draws++;

            home.points +=
                tournament.data.drawPoints;

            away.points +=
                tournament.data.drawPoints;
        }

    });


    return Object.values(table)
        .sort((a, b) => {

            const gdA =
                a.gf - a.ga;

            const gdB =
                b.gf - b.ga;


            return (
                b.points - a.points ||
                gdB - gdA ||
                b.gf - a.gf
            );
        });
}


/* =========================================================
   UCL / GROUPS
========================================================= */

function initializeChampionsFormat(
    tournament
) {

    const groupCount =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "groupCount"
                )?.value || 4
            )
        );


    const teamsPerGroup =
        Math.max(
            2,
            Number(
                document.getElementById(
                    "teamsPerGroup"
                )?.value || 4
            )
        );


    const qualify =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "qualifyCount"
                )?.value || 2
            )
        );


    const legs =
        Number(
            document.getElementById(
                "groupLegs"
            )?.value || 1
        );


    const required =
        groupCount *
        teamsPerGroup;


    const participants =
        normalizeParticipants(
            tournament.teams,
            required
        );


    const groups = [];


    for (
        let i = 0;
        i < groupCount;
        i++
    ) {

        const groupTeams =
            participants.slice(
                i * teamsPerGroup,
                (i + 1) *
                teamsPerGroup
            );


        groups.push({

            id: i,

            name:
                `GROUP ${String.fromCharCode(
                    65 + i
                )}`,

            teams:
                groupTeams.map(
                    item => item.name
                )

        });
    }


    let matches = [];


    groups.forEach(group => {

        const groupMatches =
            generateRoundRobin(
                group.teams,
                legs,
                "group"
            );


        groupMatches.forEach(
            match => {
                match.group =
                    group.id;
            }
        );


        matches.push(
            ...groupMatches
        );
    });


    tournament.data = {

        type: "ucl",

        groupCount,

        teamsPerGroup,

        qualify,

        legs:
            legs === 2 ? 2 : 1,

        groups,

        matches,

        qualified: [],

        knockout: null

    };
}


/* =========================================================
   OPEN TOURNAMENT
========================================================= */

function openTournament(
    tournamentID
) {

    const tournament =
        database[tournamentID];

    if (!tournament) return;


    state.currentTournament =
        tournament;

    state.currentMode =
        tournament.mode;


    if (tournament.mode === "league") {

        state.currentTab =
            "table";

    } else if (
        tournament.mode === "knockout"
    ) {

        state.currentTab =
            "bracket";

    } else {

        state.currentTab =
            "groups";
    }


    const title =
        document.getElementById("tTitle");

    const sub =
        document.getElementById("tSub");

    const mode =
        document.getElementById("tMode");


    title.textContent =
        tournament.name;


    sub.textContent =
        `${tournament.teams.length} فريق مشارك`;


    mode.textContent =
        tournament.mode === "knockout"
            ? "KNOCKOUT"
            : tournament.mode === "ucl"
                ? "CHAMPIONS FORMAT"
                : "LEAGUE";


    renderTournament();

    showScreen(
        "tournamentScreen"
    );
}


/* =========================================================
   RENDER TOURNAMENT
========================================================= */

function renderTournament() {

    if (!state.currentTournament) {
        return;
    }


    renderTabs();


    const content =
        document.getElementById(
            "content"
        );


    if (
        state.currentTab ===
        "table"
    ) {

        content.innerHTML =
            renderLeagueTable();

    } else if (
        state.currentTab ===
        "matches"
    ) {

        content.innerHTML =
            renderMatches(
                state.currentTournament.data.matches
            );

    } else if (
        state.currentTab ===
        "groups"
    ) {

        content.innerHTML =
            renderGroups();

    } else if (
        state.currentTab ===
        "bracket"
    ) {

        content.innerHTML =
            renderKnockout();

    } else if (
        state.currentTab ===
        "knockout"
    ) {

        content.innerHTML =
            renderChampionsKnockout();

    } else if (
        state.currentTab ===
        "settings"
    ) {

        content.innerHTML =
            renderSettings();
    }
}


/* =========================================================
   TABS
========================================================= */

function renderTabs() {

    const box =
        document.getElementById(
            "tabs"
        );


    const tournament =
        state.currentTournament;


    let tabs = [];


    if (
        tournament.mode ===
        "league"
    ) {

        tabs = [

            ["table", "الترتيب"],

            ["matches", "المباريات"],

            ["settings", "الإعدادات"]

        ];

    } else if (
        tournament.mode ===
        "knockout"
    ) {

        tabs = [

            ["bracket", "Bracket"],

            ["settings", "الإعدادات"]

        ];

    } else {

        tabs = [

            ["groups", "المجموعات"],

            ["knockout", "الأدوار الإقصائية"],

            ["settings", "الإعدادات"]

        ];
    }


    box.innerHTML =
        tabs.map(
            ([id, label]) => `

                <button
                    type="button"
                    class="tab ${
                        state.currentTab === id
                            ? "active"
                            : ""
                    }"
                    onclick="
                        setTournamentTab('${id}')
                    "
                >
                    ${label}
                </button>

            `
        ).join("");
}


function setTournamentTab(tab) {

    state.currentTab =
        tab;

    renderTournament();
}


/* =========================================================
   LEAGUE TABLE
========================================================= */

function renderLeagueTable() {

    const tournament =
        state.currentTournament;


    const table =
        calculateTable(
            tournament
        );


    return `

        <div class="content-panel">

            <div class="content-title">

                <div>
                    <h3>جدول الترتيب</h3>
                </div>

                <span>
                    ${table.length} فريق
                </span>

            </div>


            <div class="table-wrap">

                <table class="standings-table">

                    <thead>

                        <tr>

                            <th>#</th>
                            <th>الفريق</th>
                            <th>ل</th>
                            <th>ف</th>
                            <th>ت</th>
                            <th>خ</th>
                            <th>له</th>
                            <th>عليه</th>
                            <th>ن</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            table.map(
                                (row, index) => `

                                    <tr>

                                        <td>
                                            <span class="position-number">
                                                ${
                                                    index + 1
                                                }
                                            </span>
                                        </td>

                                        <td class="team-cell">
                                            ${escapeHTML(row.team)}
                                        </td>

                                        <td>${row.played}</td>

                                        <td>${row.wins}</td>

                                        <td>${row.draws}</td>

                                        <td>${row.losses}</td>

                                        <td>${row.gf}</td>

                                        <td>${row.ga}</td>

                                        <td class="points-cell">
                                            ${row.points}
                                        </td>

                                    </tr>

                                `
                            ).join("")
                        }

                    </tbody>

                </table>

            </div>

        </div>

    `;
}


/* =========================================================
   MATCHES
========================================================= */

function renderMatches(
    matches
) {

    if (!matches?.length) {

        return `

            <div class="empty-state">

                <strong>
                    لا توجد مباريات
                </strong>

                <span>
                    لم يتم إنشاء مباريات بعد.
                </span>

            </div>

        `;
    }


    return `

        <div class="content-panel">

            <div class="content-title">

                <h3>المباريات</h3>

                <span>
                    ${matches.length} مباراة
                </span>

            </div>


            <div class="matches-list">

                ${
                    matches.map(
                        match => `

                            <div class="match-card">

                                <div class="match-team home">
                                    ${escapeHTML(match.home)}
                                </div>


                                <div class="match-vs">

                                    <span>
                                        ${
                                            match.played
                                                ? "مكتملة"
                                                : "لم تلعب"
                                        }
                                    </span>


                                    <div class="score-inputs">

                                        <input
                                            id="home_${match.id}"
                                            class="score-input"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.homeScore ??
                                                ""
                                            }"
                                        >

                                        <span>
                                            -
                                        </span>

                                        <input
                                            id="away_${match.id}"
                                            class="score-input"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.awayScore ??
                                                ""
                                            }"
                                        >

                                    </div>

                                </div>


                                <div class="match-team away">
                                    ${escapeHTML(match.away)}
                                </div>


                                <div class="match-actions">

                                    <button
                                        class="save-score"
                                        type="button"
                                        onclick="
                                            saveLeagueMatch(
                                                '${match.id}'
                                            )
                                        "
                                    >
                                        حفظ النتيجة
                                    </button>

                                </div>

                            </div>

                        `
                    ).join("")
                }

            </div>

        </div>

    `;
}


function saveLeagueMatch(
    matchID
) {

    const tournament =
        state.currentTournament;


    const match =
        tournament.data.matches
            .find(
                item =>
                    item.id === matchID
            );


    if (!match) return;


    const homeInput =
        document.getElementById(
            `home_${matchID}`
        );

    const awayInput =
        document.getElementById(
            `away_${matchID}`
        );


    if (
        homeInput.value === "" ||
        awayInput.value === ""
    ) {

        showToast(
            "اكتب نتيجتي الفريقين."
        );

        return;
    }


    const homeScore =
        Number(homeInput.value);

    const awayScore =
        Number(awayInput.value);


    if (
        homeScore < 0 ||
        awayScore < 0 ||
        !Number.isFinite(homeScore) ||
        !Number.isFinite(awayScore)
    ) {

        showToast(
            "النتيجة غير صحيحة."
        );

        return;
    }


    match.homeScore =
        homeScore;

    match.awayScore =
        awayScore;

    match.played =
        true;


    saveCurrentTournament();

    renderTournament();

    showToast(
        "تم حفظ النتيجة."
    );
}


/* =========================================================
   GROUPS
========================================================= */

function getGroupMatches(
    groupID
) {

    return state.currentTournament
        .data.matches
        .filter(
            match =>
                match.group === groupID
        );
}


function calculateGroupTable(
    group
) {

    const tournament =
        state.currentTournament;


    const table = {};


    group.teams.forEach(
        team => {

            table[team] = {

                team,

                played: 0,

                wins: 0,

                draws: 0,

                losses: 0,

                gf: 0,

                ga: 0,

                points: 0

            };

        }
    );


    getGroupMatches(group.id)
        .forEach(match => {

            if (
                !match.played ||
                match.homeScore === null ||
                match.awayScore === null
            ) {
                return;
            }


            const home =
                table[match.home];

            const away =
                table[match.away];


            if (!home || !away) return;


            home.played++;
            away.played++;


            home.gf +=
                Number(match.homeScore);

            home.ga +=
                Number(match.awayScore);


            away.gf +=
                Number(match.awayScore);

            away.ga +=
                Number(match.homeScore);


            if (
                match.homeScore >
                match.awayScore
            ) {

                home.wins++;

                away.losses++;

                home.points +=
                    3;

            } else if (
                match.homeScore <
                match.awayScore
            ) {

                away.wins++;

                home.losses++;

                away.points +=
                    3;

            } else {

                home.draws++;

                away.draws++;

                home.points++;

                away.points++;
            }

        });


    return Object.values(table)
        .sort((a, b) => {

            const gdA =
                a.gf - a.ga;

            const gdB =
                b.gf - b.ga;


            return (
                b.points - a.points ||
                gdB - gdA ||
                b.gf - a.gf
            );
        });
}


function renderMiniTable(
    rows
) {

    return `

        <table class="mini-table">

            <thead>

                <tr>
                    <th>#</th>
                    <th>الفريق</th>
                    <th>ل</th>
                    <th>ن</th>
                </tr>

            </thead>

            <tbody>

                ${
                    rows.map(
                        (row, index) => `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td class="team">
                                    ${escapeHTML(row.team)}
                                </td>

                                <td>
                                    ${row.played}
                                </td>

                                <td>
                                    ${row.points}
                                </td>

                            </tr>

                        `
                    ).join("")
                }

            </tbody>

        </table>

    `;
}


function renderGroups() {

    const tournament =
        state.currentTournament;


    const groups =
        tournament.data.groups;


    return `

        <div class="content-panel">

            <div class="content-title">

                <h3>دور المجموعات</h3>

                <span>
                    ${groups.length} مجموعة
                </span>

            </div>


            <div class="groups-grid">

                ${
                    groups.map(
                        group => {

                            const rows =
                                calculateGroupTable(
                                    group
                                );


                            const matches =
                                getGroupMatches(
                                    group.id
                                );


                            const finished =
                                matches.length === 0 ||
                                matches.every(
                                    match =>
                                        match.played
                                );


                            return `

                                <div class="group-card">

                                    <div class="group-header">

                                        <strong>
                                            ${escapeHTML(group.name)}
                                        </strong>

                                        <span>
                                            ${group.teams.length} فرق
                                        </span>

                                    </div>


                                    ${renderMiniTable(rows)}


                                    <div class="group-actions">

                                        <button
                                            type="button"
                                            class="toolbar-button"
                                            onclick="
                                                showGroupMatches(
                                                    ${group.id}
                                                )
                                            "
                                        >
                                            ${
                                                finished
                                                    ? "عرض المباريات"
                                                    : "إكمال المباريات"
                                            }
                                        </button>

                                    </div>

                                </div>

                            `;
                        }
                    ).join("")
                }

            </div>

        </div>


        <div class="content-panel">

            <div class="content-title">

                <h3>التأهل</h3>

                <span>
                    ${tournament.data.qualify}
                    من كل مجموعة
                </span>

            </div>


            <div class="notice">

                أكمل مباريات جميع المجموعات،
                ثم اضغط على زر التأهل لاختيار
                الفرق الأعلى في الترتيب.

            </div>


            <div class="toolbar" style="margin-top:12px;margin-bottom:0;">

                <div class="toolbar-left">

                    <button
                        type="button"
                        class="primary-button"
                        onclick="qualifyGroups()"
                    >
                        تأكيد المتأهلين
                    </button>

                </div>

            </div>

        </div>

    `;
}


function showGroupMatches(
    groupID
) {

    state.currentGroupID =
        groupID;

    const matches =
        getGroupMatches(
            groupID
        );


    const group =
        state.currentTournament
            .data.groups
            .find(
                item =>
                    item.id === groupID
            );


    const content =
        document.getElementById(
            "content"
        );


    content.innerHTML = `

        <div class="content-panel">

            <div class="content-title">

                <div>

                    <h3>
                        ${escapeHTML(group.name)}
                    </h3>

                    <span>
                        مباريات المجموعة
                    </span>

                </div>


                <button
                    type="button"
                    class="toolbar-button"
                    onclick="renderTournament()"
                >
                    رجوع
                </button>

            </div>


            <div class="matches-list">

                ${
                    matches.map(
                        match => `

                            <div class="match-card">

                                <div class="match-team home">
                                    ${escapeHTML(match.home)}
                                </div>


                                <div class="match-vs">

                                    <span>
                                        ${
                                            match.played
                                                ? "مكتملة"
                                                : "لم تلعب"
                                        }
                                    </span>


                                    <div class="score-inputs">

                                        <input
                                            id="home_${match.id}"
                                            class="score-input"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.homeScore ??
                                                ""
                                            }"
                                        >

                                        <span>-</span>

                                        <input
                                            id="away_${match.id}"
                                            class="score-input"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.awayScore ??
                                                ""
                                            }"
                                        >

                                    </div>

                                </div>


                                <div class="match-team away">
                                    ${escapeHTML(match.away)}
                                </div>


                                <div class="match-actions">

                                    <button
                                        type="button"
                                        class="save-score"
                                        onclick="
                                            saveGroupMatch(
                                                '${match.id}'
                                            )
                                        "
                                    >
                                        حفظ النتيجة
                                    </button>

                                </div>

                            </div>

                        `
                    ).join("")
                }

            </div>

        </div>

    `;
}


function saveGroupMatch(
    matchID
) {

    const match =
        state.currentTournament
            .data.matches
            .find(
                item =>
                    item.id === matchID
            );


    if (!match) return;


    const homeInput =
        document.getElementById(
            `home_${matchID}`
        );

    const awayInput =
        document.getElementById(
            `away_${matchID}`
        );


    if (
        homeInput.value === "" ||
        awayInput.value === ""
    ) {

        showToast(
            "اكتب نتيجة المباراة."
        );

        return;
    }


    match.homeScore =
        Number(homeInput.value);

    match.awayScore =
        Number(awayInput.value);

    match.played =
        true;


    saveCurrentTournament();

    renderTournament();

    showToast(
        "تم حفظ نتيجة المجموعة."
    );
}


/* =========================================================
   QUALIFICATION
========================================================= */

function qualifyGroups() {

    const tournament =
        state.currentTournament;


    const groups =
        tournament.data.groups;


    const allFinished =
        groups.every(
            group => {

                const matches =
                    getGroupMatches(
                        group.id
                    );

                return (
                    matches.length > 0 &&
                    matches.every(
                        match =>
                            match.played
                    )
                );
            }
        );


    if (!allFinished) {

        showToast(
            "أكمل جميع مباريات المجموعات أولاً."
        );

        return;
    }


    const qualified = [];


    groups.forEach(
        group => {

            const table =
                calculateGroupTable(
                    group
                );


            const count =
                Math.min(
                    tournament.data.qualify,
                    table.length
                );


            for (
                let i = 0;
                i < count;
                i++
            ) {

                qualified.push(
                    table[i].team
                );
            }

        }
    );


    tournament.data.qualified =
        qualified;


    createChampionsKnockout(
        tournament,
        qualified
    );


    saveCurrentTournament();


    state.currentTab =
        "knockout";


    renderTournament();


    showToast(
        "تم تأكيد المتأهلين."
    );
}


/* =========================================================
   CHAMPIONS KNOCKOUT
========================================================= */

function createChampionsKnockout(
    tournament,
    teams
) {

    const target =
        getNextPowerOfTwo(
            teams.length
        );


    const participants =
        normalizeParticipants(
            teams,
            target
        );


    tournament.data.knockout = {

        size: target,

        rounds: [],

        champion: null

    };


    createChampionsRound(
        tournament,
        participants,
        1
    );
}


function createChampionsRound(
    tournament,
    participants,
    roundNumber
) {

    const matches = [];


    for (
        let i = 0;
        i < participants.length;
        i += 2
    ) {

        const home =
            participants[i];

        const away =
            participants[i + 1];


        matches.push({

            id: createID("uclmatch"),

            home: home.name,

            away: away.name,

            homeIsBot:
                Boolean(home.isBot),

            awayIsBot:
                Boolean(away.isBot),

            winner: null,

            played: false

        });

    }


    tournament.data.knockout
        .rounds
        .push({

            number:
                roundNumber,

            matches

        });
}


function renderChampionsKnockout() {

    const tournament =
        state.currentTournament;


    const knockout =
        tournament.data.knockout;


    if (!knockout) {

        return `

            <div class="empty-state">

                <strong>
                    لم يبدأ الدور الإقصائي
                </strong>

                <span>
                    أكمل المجموعات ثم أكد المتأهلين.
                </span>

            </div>

        `;
    }


    const qualified =
        tournament.data.qualified || [];


    return `

        <div class="content-panel">

            <div class="content-title">

                <h3>الفرق المتأهلة</h3>

                <span>
                    ${qualified.length} فريق
                </span>

            </div>


            <div class="qualified-list">

                ${
                    qualified.map(
                        team => `

                            <div class="qualified-item">
                                ${escapeHTML(team)}
                            </div>

                        `
                    ).join("")
                }

            </div>

        </div>


        ${
            renderKnockoutHTML(
                knockout
            )
        }

    `;
}


/* =========================================================
   KNOCKOUT RENDER
========================================================= */

function getRoundName(
    matches
) {

    if (matches === 1) {
        return "النهائي";
    }

    if (matches === 2) {
        return "نصف النهائي";
    }

    if (matches === 4) {
        return "ربع النهائي";
    }

    if (matches === 8) {
        return "دور الـ16";
    }

    return `دور الـ${matches * 2}`;
}


function renderKnockout() {

    const tournament =
        state.currentTournament;


    const knockout =
        tournament.data;


    if (
        knockout.champion
    ) {

        return `

            ${renderChampion(
                knockout.champion
            )}

        `;
    }


    return `

        <div class="content-panel">

            <div class="toolbar">

                <div class="toolbar-left">

                    <button
                        type="button"
                        class="primary-button"
                        onclick="advanceKnockout()"
                    >
                        إنشاء الدور التالي
                    </button>

                </div>

            </div>


            ${renderKnockoutHTML(
                knockout
            )}

        </div>

    `;
}


function renderKnockoutHTML(
    knockout
) {

    const rounds =
        knockout.rounds;


    if (!rounds?.length) {

        return `

            <div class="empty-state">

                <strong>
                    لا توجد مباريات
                </strong>

            </div>

        `;
    }


    return `

        <div class="bracket-wrapper">

            <div class="bracket">

                ${
                    rounds.map(
                        round => `

                            <div class="bracket-round">

                                <div class="bracket-round-title">

                                    ${getRoundName(
                                        round.matches.length
                                    )}

                                </div>


                                <div class="bracket-matches">

                                    ${
                                        round.matches.map(
                                            match =>
                                                renderBracketMatch(
                                                    match
                                                )
                                        ).join("")
                                    }

                                </div>

                            </div>

                        `
                    ).join("")
                }

            </div>

        </div>

    `;
}


function renderBracketMatch(
    match
) {

    const homeWinner =
        match.winner ===
        match.home;


    const awayWinner =
        match.winner ===
        match.away;


    return `

        <div class="bracket-match">

            <button
                type="button"
                class="
                    bracket-team
                    ${
                        homeWinner
                            ? "winner"
                            : ""
                    }
                    ${
                        match.played &&
                        !homeWinner
                            ? "loser"
                            : ""
                    }
                    ${
                        match.homeIsBot
                            ? "bot"
                            : ""
                    }
                "
                onclick="
                    chooseKnockoutWinner(
                        '${match.id}',
                        '${escapeAttribute(
                            match.home
                        )}'
                    )
                "
            >

                <span class="bracket-team-name">
                    ${escapeHTML(match.home)}
                </span>

                <span class="bracket-score">
                    ${
                        homeWinner
                            ? "✓"
                            : ""
                    }
                </span>

            </button>


            <button
                type="button"
                class="
                    bracket-team
                    ${
                        awayWinner
                            ? "winner"
                            : ""
                    }
                    ${
                        match.played &&
                        !awayWinner
                            ? "loser"
                            : ""
                    }
                    ${
                        match.awayIsBot
                            ? "bot"
                            : ""
                    }
                "
                onclick="
                    chooseKnockoutWinner(
                        '${match.id}',
                        '${escapeAttribute(
                            match.away
                        )}'
                    )
                "
            >

                <span class="bracket-team-name">
                    ${escapeHTML(match.away)}
                </span>

                <span class="bracket-score">
                    ${
                        awayWinner
                            ? "✓"
                            : ""
                    }
                </span>

            </button>


            ${
                match.winner
                    ? `
                        <div class="bracket-select-label">
                            الفائز: ${escapeHTML(match.winner)}
                        </div>
                    `
                    : `
                        <div class="bracket-select-label">
                            اضغط على الفريق لاختيار الفائز
                        </div>
                    `
            }

        </div>

    `;
}


function escapeAttribute(
    value
) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   CHAMPION
========================================================= */

function renderChampion(
    champion
) {

    return `

        <div class="champion-card">

            <div class="champion-icon">

                <svg viewBox="0 0 64 64">

                    <path
                        d="M18 11H46V24C46 37 38 46 32 49C26 46 18 37 18 24V11Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                    />

                    <path
                        d="M25 51H39M32 49V57"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                    />

                </svg>

            </div>

            <small>
                CHAMPION
            </small>

            <h3>
                ${escapeHTML(champion)}
            </h3>

        </div>

    `;
}


/* =========================================================
   SETTINGS
========================================================= */

function renderSettings() {

    const tournament =
        state.currentTournament;


    return `

        <div class="content-panel">

            <div class="content-title">

                <h3>معلومات البطولة</h3>

            </div>


            <div class="settings-grid">

                <div class="setting-item">

                    <span>
                        الاسم
                    </span>

                    <strong>
                        ${escapeHTML(
                            tournament.name
                        )}
                    </strong>

                </div>


                <div class="setting-item">

                    <span>
                        عدد الفرق
                    </span>

                    <strong>
                        ${tournament.teams.length}
                    </strong>

                </div>


                <div class="setting-item">

                    <span>
                        النظام
                    </span>

                    <strong>
                        ${
                            tournament.mode === "knockout"
                                ? "Knockout"
                                : tournament.mode === "ucl"
                                    ? "Champions Format"
                                    : "League"
                        }
                    </strong>

                </div>

            </div>

        </div>


        <div class="content-panel">

            <div class="danger-zone">

                <h4>
                    منطقة التحكم
                </h4>

                <p>
                    يمكنك إعادة ضبط البطولة أو حذفها نهائيًا.
                </p>


                <div class="toolbar">

                    <div class="toolbar-left">

                        <button
                            type="button"
                            class="toolbar-button"
                            onclick="resetTournament()"
                        >
                            إعادة ضبط البطولة
                        </button>


                        <button
                            type="button"
                            class="toolbar-button"
                            onclick="deleteCurrentTournament()"
                        >
                            حذف البطولة
                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;
}


/* =========================================================
   SAVE CURRENT
========================================================= */

function saveCurrentTournament() {

    if (
        !state.currentTournament
    ) {
        return;
    }


    database[
        state.currentTournament.id
    ] =
        state.currentTournament;


    saveDatabase();
}


/* =========================================================
   RESET
========================================================= */

function resetTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    const confirmed =
        confirm(
            "هل تريد إعادة ضبط هذه البطولة؟ سيتم حذف النتائج الحالية."
        );


    if (!confirmed) return;


    if (
        tournament.mode ===
        "knockout"
    ) {

        initializeKnockout(
            tournament
        );

        state.currentTab =
            "bracket";

    } else if (
        tournament.mode ===
        "ucl"
    ) {

        initializeChampionsFormat(
            tournament
        );

        state.currentTab =
            "groups";

    } else {

        initializeLeague(
            tournament
        );

        state.currentTab =
            "table";
    }


    saveCurrentTournament();

    renderTournament();

    showToast(
        "تم إعادة ضبط البطولة."
    );
}


/* =========================================================
   DELETE CURRENT
========================================================= */

function deleteCurrentTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    const confirmed =
        confirm(
            "هل أنت متأكد من حذف البطولة نهائيًا؟"
        );


    if (!confirmed) return;


    delete database[
        tournament.id
    ];


    saveDatabase();


    state.currentTournament =
        null;


    goHome();


    showToast(
        "تم حذف البطولة."
    );
}


/* =========================================================
   SAVED TOURNAMENTS
========================================================= */

function renderSavedTournaments() {

    const box =
        document.getElementById(
            "savedBox"
        );


    if (!box) return;


    const tournaments =
        Object.values(database)
            .sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            );


    if (!tournaments.length) {

        box.innerHTML = "";

        return;
    }


    box.innerHTML = `

        <div class="saved-heading">

            <div>

                <span class="section-kicker">
                    SAVED
                </span>

                <h3>
                    البطولات المحفوظة
                </h3>

            </div>

            <span class="saved-count">
                ${tournaments.length} بطولة
            </span>

        </div>


        <div class="saved-grid">

            ${
                tournaments.map(
                    tournament => `

                        <div class="saved-card">

                            <div class="saved-info">

                                <strong>
                                    ${escapeHTML(
                                        tournament.name
                                    )}
                                </strong>

                                <span>
                                    ${
                                        tournament.mode === "knockout"
                                            ? "Knockout"
                                            : tournament.mode === "ucl"
                                                ? "Champions Format"
                                                : "League"
                                    }

                                    ·

                                    ${tournament.teams.length}
                                    فرق
                                </span>

                            </div>


                            <div class="saved-actions">

                                <button
                                    type="button"
                                    class="small-button"
                                    onclick="
                                        openTournament(
                                            '${tournament.id}'
                                        )
                                    "
                                >
                                    فتح
                                </button>


                                <button
                                    type="button"
                                    class="small-button danger"
                                    onclick="
                                        deleteTournament(
                                            '${tournament.id}'
                                        )
                                    "
                                >
                                    حذف
                                </button>

                            </div>

                        </div>

                    `
                ).join("")
            }

        </div>

    `;
}


function deleteTournament(
    tournamentID
) {

    const tournament =
        database[tournamentID];


    if (!tournament) return;


    const confirmed =
        confirm(
            `حذف بطولة "${tournament.name}"؟`
        );


    if (!confirmed) return;


    delete database[
        tournamentID
    ];


    saveDatabase();

    renderSavedTournaments();

    showToast(
        "تم حذف البطولة."
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const input =
            document.getElementById(
                "teamInput"
            );


        if (
            event.key === "Enter" &&
            document.activeElement === input
        ) {

            event.preventDefault();

            addTeam();
        }

    }
);


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderSavedTournaments();

        renderTeamsList();

    }
);