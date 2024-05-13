//By MadeBomb (Me).


let projectileFrame = document.querySelector('.projectile-frame');


async function genProjectiles(projectileAmount) {
    const delta = 1.5;
    //100% of the container height for uniform spacing.
    let spaceBetween = 100 / projectileAmount;

    let currentSpacing = 10;

    for (let i = 0; i < projectileAmount; i++) {

        let projectile = document.createElement('span');
        projectileFrame.appendChild(projectile);
        projectile.style.top = `${currentSpacing}%`;
        projectile.style.animation = `normalProjectile ${Math.random() * delta + 1}s linear infinite`;

        currentSpacing += spaceBetween;
    }
}

genProjectiles(6);