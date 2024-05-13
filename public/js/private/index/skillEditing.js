let currentEditingSkillId = null;
let currentEditorColor = 0;
let currentEditorType = 0;

let skills = [];
let skillEditing = false;

skillImgInput.addEventListener("change", (e) => {
    const url = URL.createObjectURL(e.target.files[0]);
    currentSkillImage.src = url;
    currentSkillImage.style.display = "flex";
    skillLabel.classList.remove('border-[.35em]');
});

editorTypeSelector.addEventListener('click', (e) => {
    const target = e.target.closest('button');

    if (target) {
        updateTypeInputs(Number(target.id.substring(2)));
    }
});

function updateTypeInputs(id) {
    const elements = Array.from(editorTypeSelector.children);

    currentEditorType = id;
    elements[id].classList.add('bg-alternate1', 'text-white');

    for (let i = 0; i < elements.length; i++) {
        if (i != id) {
            elements[i].classList.remove('bg-alternate1', 'text-white');
        }
    }
}

editorColorSelector.addEventListener('click', (e) => {
    const target = e.target.closest('button');

    if (target) {
        updateColorInputs(Number(target.id.substring(2)));
    }
});

function updateColorInputs(id) {
    const elements = Array.from(editorColorSelector.children);

    currentEditorColor = id;
    elements[id].classList.add('border-[.3em]');

    for (let i = 0; i < elements.length; i++) {
        if (i != id) {
            elements[i].classList.remove('border-[.3em]');
        }
    }
}


function selectAndLoadSkill(id) {
    let d = skills[id];

    if (d) {
        skillEditing = true;
        skillName.value = d.name;
        skillDesc.value = d.desc;
        skillPower.value = d.power;
        skillId.textContent = `ID: ${d._id}`;
        currentSkillImage.src = d.img;
        currentSkillImage.style.display = 'flex';
        currentEditingSkillId = d._id;
        skillLabel.classList.remove('border-[.35em]');
        updateColorInputs(d.color);
        updateTypeInputs(d.type);
    }

    else {
        console.error('selectAndLoadSkill() - Skill index does not exist!')
    }
}

async function updateChartData() {
    const data = await getJSONFromNode({}, "http://localhost:3500/get-skill-stats");

    colorsGraph.data.datasets[0].data = data;
    colorsGraph.update();
}

async function loadSkills(target, filter = {}) {
    skillsLoader.style.display = 'flex';

    target.innerHTML = '';

    skills = await getJSONFromNode(filter, "http://localhost:3500/get-skills");

    for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];

        let typeIcon;
        let color;

        if (skill.type == 0) {
            typeIcon = 'fa-person-rifle';
        }

        else if (skill.type == 1) {
            typeIcon = 'fa-chess-king';
        }

        else if (skill.type == 2) {
            typeIcon = 'fa-meteor';
        }



        if (skill.color == 0) {
            color = 'bg-red-600';
        }

        else if (skill.color == 1) {
            color = 'bg-yellow-300';
        }

        else if (skill.color == 2) {
            color = 'bg-green-500';
        }

        else if (skill.color == 3) {
            color = 'bg-purple-500';
        }

        target.innerHTML +=
            `
        <button onclick="selectAndLoadSkill(${i})" class="relative flex h-fit w-full cursor-pointer flex-col rounded-[1em]" style="box-shadow: 0px 2px 9px 1px rgba(31, 28, 65, 0.15)">
            <div class="absolute left-[-.5em] top-[-.5em] z-10 h-[5em] w-[5em] overflow-hidden rounded-[1em] bg-slate-600">
                <img src="${skill.img}" class="h-full w-full object-cover" />
            </div>

            <div class="flex w-full flex-col px-[1em] py-[1em]">
                <div class="ml-[4.2em]">
                    <h1 class="w-fit font-Archive text-[1.7em]">${skill.name}</h1>
                </div>

                <p class="mt-[1.8em] text-left">${skill.desc}</p>
            </div>
            <div class="flex w-full gap-[1em] rounded-b-[.8em] ${color} py-[.5em]">
                <span class="ml-[.5em] flex w-fit items-center gap-[.3em] rounded-[.5em] bg-white px-[.5em] py-[.3em]" style="box-shadow: 0px 2px 9px 1px rgba(31, 28, 65, 0.15)">
                    <p class="text-[1.5em]">${skill.power}</p>
                    <i class="fa-solid fa-bolt-lightning text-[1.2em]"></i>
                </span>
                <span class="flex h-[2.8em] w-[2.8em] cursor-pointer items-center justify-center rounded-[.5em] bg-white" style="box-shadow: 0px 2px 9px 1px rgba(31, 28, 65, 0.15)">
                    <i class="fa-solid ${typeIcon} text-[1.4em]"></i>
                </span>
            </div>
        </button>
        `;
    }

    skillsLoader.style.display = 'none';
    updateChartData();
}

function checkStatInput(target) {
    target.value = target.value.replace(/[^0-9]/g, '0');
}

function checkStatBlur(target) {
    if (target.value == '') {
        target.value = 0;
    }
}

skillPower.addEventListener('input', (e) => {
    checkStatInput(e.target);
});


skillPower.addEventListener('blur', (e) => {
    checkStatBlur(e.target);
});


////////////// SEARCH BAR ///////////////

let searchSkillQuery = {
    name: '',
    color: null,
    type: null,
}

const skillSearchBar = document.getElementById('skill-search-bar');

let skillSearchTemp;

skillSearchBar.addEventListener('keyup', (e) => {
    clearTimeout(skillSearchTemp);
    // Inicia un nuevo temporizador
    skillSearchTemp = setTimeout(() => {
        searchSkillQuery.name = e.target.value;
        loadSkills(skillMasonry, searchSkillQuery);
    }, 300);
});

const barColorSelector = document.getElementById("bar-color-selector");

function updateBarColorBtns(id) {
    const elements = Array.from(barColorSelector.children);

    if (id == searchSkillQuery.color) {
        searchSkillQuery.color = null;
    } else {
        searchSkillQuery.color = id;
    }

    for (let i = 0; i < elements.length; i++) {
        if (i != searchSkillQuery.color) {
            elements[i].classList.remove("border-[.3em]");
        } else {
            elements[id].classList.add("border-[.3em]");
        }
    }

    loadSkills(skillMasonry, searchSkillQuery);
}

const barTypeSelector = document.getElementById("bar-type-selector");

function updateBarTypeBtns(id) {
    const elements = Array.from(barTypeSelector.children);

    if (id == searchSkillQuery.type) {
        searchSkillQuery.type = null;
    } else {
        searchSkillQuery.type = id;
    }

    for (let i = 0; i < elements.length; i++) {
        if (i != searchSkillQuery.type) {
            elements[i].classList.remove("bg-alternate1", "text-white");
        } else {
            elements[i].classList.add("bg-alternate1", "text-white");
        }
    }

    loadSkills(skillMasonry, searchSkillQuery);
}

//////////// EDITOR BUTTONS ////////////

function resetEditor() {
    skillEditing = false;
    skillName.value = '';
    skillDesc.value = '';
    skillPower.value = 0;
    skillImgInput.value = '';
    skillId.textContent = 'ID: unfilled';
    currentSkillImage.src = '';
    currentSkillImage.style.display = 'none';
    currentEditingSkillId = null;
    skillLabel.classList.add('border-[.35em]');
    updateColorInputs(0);
    updateTypeInputs(0);
}

newSkill.addEventListener('click', async () => {
    resetEditor();
});

saveSkill.addEventListener('click', async () => {
    if (skillImgInput.files.length != 0 || skillEditing) {
        if (skillName.value != '') {
            if (skillDesc.value != '') {
                if (skillPower.value != undefined) {
                    let data = {
                        name: skillName.value,
                        desc: skillDesc.value,
                        power: Number(skillPower.value),
                        color: currentEditorColor,
                        type: currentEditorType,
                    }

                    if (skillImgInput.files.length != 0) {
                        data.img = await toBase64(skillImgInput.files[0]);
                    }

                    if (currentEditingSkillId != null) {
                        data._id = currentEditingSkillId;
                    }

                    sendJSONToNode(data, "http://localhost:3500/save-skill", (xhr) => {

                        const xhrCode = xhr.status;

                        if (xhrCode >= 200 && xhrCode < 300) {
                            resetEditor();
                            loadSkills(skillMasonry, searchSkillQuery);
                        } else {
                        }
                    });
                }
            }
        }
    }
});


deleteSkill.addEventListener('click', async () => {
    sendJSONToNode({ _id: currentEditingSkillId }, "http://localhost:3500/delete-skill", (xhr) => {
        const xhrCode = xhr.status;

        if (xhrCode >= 200 && xhrCode < 300) {
            console.log(`${xhrCode} - ${xhr.responseText}`);
            resetEditor();
            loadSkills(skillMasonry, searchSkillQuery);

        } else {
            console.error(`${xhrCode} - ${xhr.responseText}`);
        }
    });
});

loadSkills(skillMasonry, searchSkillQuery);




