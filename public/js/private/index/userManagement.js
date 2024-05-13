let currentUserId = null;
let userFilterType = 'email';

let users = [];

let banner = {};

userFilter.addEventListener('click', (e) => {
    const target = e.target.closest('button');

    if (target) {
        userFilterType = target.id.substring(2);
        updateUserFilterInputs(userFilterType);

        searchUsers(userSearch.value);
    }
});

function updateUserFilterInputs(id) {
    const elements = Array.from(userFilter.children);
    let buttonNum;

    if (id == 'email') {
        buttonNum = 0;
    }

    else if (id == 'nickname') {
        buttonNum = 1;
    }

    elements[buttonNum].classList.add('bg-alternate1', 'text-white');

    console.log(elements[buttonNum]);

    for (let i = 0; i < elements.length; i++) {
        if (i != buttonNum) {
            elements[i].classList.remove('bg-alternate1', 'text-white');
        }
    }
}

let temporizador;

userSearch.addEventListener('keyup', (e) => {
    clearTimeout(temporizador);
    // Inicia un nuevo temporizador
    temporizador = setTimeout(() => {
        searchUsers(e.target.value);
    }, 300);
});

async function searchUsers(name) {
    users = await getJSONFromNode({ query: { [userFilterType]: name } }, "http://localhost:3500/get-users");
    userList.innerHTML = '';

    let icon;

    if (userFilterType == 'email') {
        icon = 'at';
    } else {
        icon = 'user';
    }
    console.log(icon);

    for (let i = 0; i < users.length; i++) {
        userList.innerHTML += `
        <div onclick="loadUser(${i})" class="flex h-[2.5em] w-full cursor-pointer items-center overflow-hidden rounded-[.5em]" style="box-shadow: 0px 2px 9px 1px rgba(31, 28, 65, 0.15)">
            <span class="flex h-full min-w-[2.5em] items-center justify-center rounded-[.5em] bg-violet-200">
                <i class="fa-solid fa-${icon} text-[1.2em]"></i>
            </span>
            <p class="ml-[.6em] mr-[.7em] w-full text-left text-[1.1em]">${users[i][userFilterType]}</p>
        </div>
    `;
    }
}

function resetUserManager() {
    currentUserId = null;

    profileBannerImg.style.display = 'none';
    profileBanner.style.backgroundImage = `url('')`;
    profileBannerText.textContent = 'SELECT A PROFILE...';
    profileBannerText.style.color = "#FFFFFF";
    profileBanner.style.borderColor = "#524AA6";
    profileBannerTextBg.style.backgroundColor = "#524AA6";

    profileEmail.textContent = 'EMAIL';
    profileId.textContent = 'ID';
    profileDate.textContent = 'XX/XX/XXXX';
    profileIsPro.textContent = 'IS PRO?';

    document.getElementById('user-m-buttons').classList.add('opacity-40');
    document.getElementById("user-m-buttons").classList.remove('opacity-100');
    document.getElementById("delete-user").classList.add('cursor-auto');
    document.getElementById("reset-password").classList.add('cursor-auto');
}

async function loadBanner(nickname) {

    banner = await getJSONFromNode({ userId: currentUserId }, "http://localhost:3500/get-banner");

    console.log(banner);

    profileBannerImg.style.display = 'block';
    if (banner.profileImg) {
        profileBannerImg.src = banner.profileImg;
    }
    else {
        profileBannerImg.src = './img/genericProfile.jpg';
    }

    if (banner.backgroundImg) {
        profileBanner.style.backgroundImage = `url(${banner.backgroundImg})`;
    } else {
        profileBanner.style.backgroundImage = `url(./img/genericBg.jpg)`;
    }

    profileBannerText.textContent = nickname;
    profileBannerText.style.color = banner.color;

    profileBanner.style.borderColor = banner.bgColor;
    profileBannerTextBg.style.backgroundColor = banner.bgColor;
}

async function loadUser(id) {
    const user = users[id];

    console.log(user);

    currentUserId = user._id;

    if (user) {

        const formatted = new Date(user.creationDate);

        const day = formatted.getDate().toString().padStart(2, '0');
        const month = (formatted.getMonth() + 1).toString().padStart(2, '0');
        const year = formatted.getFullYear();

        profileEmail.textContent = user.email;
        profileId.textContent = user._id;
        profileDate.textContent = `${day}-${month}-${year}`;
        profileIsPro.textContent = user.isPro;

        if (user.isPro) {
            profileIsPro.textContent = 'Pro Account';
        }

        else {
            profileIsPro.textContent = 'Free Account';
        }

        loadBanner(user.nickname);

        document.getElementById('user-m-buttons').classList.remove('opacity-40');
        document.getElementById('user-m-buttons').classList.add('opacity-100');
        document.getElementById("delete-user").classList.remove('cursor-auto');
        document.getElementById("reset-password").classList.remove('cursor-auto');
    }
}

document.getElementById("reset-password").addEventListener('click', () => {
    if (currentUserId) {
        resetPasswordPopup.style.display = 'flex';
    }
});

document.getElementById("delete-user").addEventListener('click', () => {
    if (currentUserId) {
        deleteUserPopup.style.display = 'flex';
    }
});

const resetUserButtons = document.getElementById('reset-password-buttons').querySelectorAll('button');

resetUserButtons[0].addEventListener('click', async (e) => {
    if (currentUserId != null) {
        await sendJSONToNode({ _id: currentUserId }, "http://localhost:3500/reset-password", (xhr) => {
            const xhrCode = xhr.status;

            if (xhrCode >= 200 && xhrCode < 300) {
                console.log(`${xhrCode} - ${xhr.responseText}`);

            } else {
                console.error(`${xhrCode} - ${xhr.responseText}`);
            }
        });

        currentUserId = null;
        e.target.style.display = 'none';
    }
});

resetUserButtons[1].addEventListener('click', async (e) => {
    resetPasswordPopup.style.display = 'none';
});

const deleteUserButtons = document.getElementById('delete-user-buttons').querySelectorAll('button');

deleteUserButtons[0].addEventListener('click', () => {
    if (currentUserId != null) {
        sendJSONToNode({ _id: currentUserId }, "http://localhost:3500/delete-user", (xhr) => {
            const xhrCode = xhr.status;

            if (xhrCode >= 200 && xhrCode < 300) {
                deleteUserPopup.style.display = 'none';
                searchUsers(userSearch.value);
                resetUserManager();

            } else {
                console.error(`${xhrCode} - ${xhr.responseText}`);
            }
        });
    }
});

deleteUserButtons[1].addEventListener('click', async (e) => {
    deleteUserPopup.style.display = 'none';
});

searchUsers('');