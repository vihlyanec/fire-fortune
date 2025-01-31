(() => {
  setTimeout(async () => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.expand();
    }

    function showBackButton() {
      if (!tg) {
        return;
      }
      tg?.MainButton.setText("Благодарю")
        .show()
        .onClick(() => {
          tg.close();
          webviewClose();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const clientId = +urlParams.get("id") || 1545106315;

    const userVariables = await getUserVariables(clientId);
    let isGetPrize = !userVariables;
    let { a1, a2, a3, a4, a5, a6, a7, a8 } = userVariables;
    let availableSpins = userVariables.available_spins;
    let dealSpins = userVariables.deal_spins;
    let commonPrizeCount = 0;

    const prizes = [
      { text: "Книга «Говорим откровенно»", dropChance: +a1 > 0 ? 1 : 0 },
      { text: "Карты для пар", dropChance: +a2 > 0 ? 1 : 0 },
      { text: "Грант на программу «Shine BRIGHT»", dropChance: +a3 > 0 ? 3 : 0 },
      { text: "Личная консультация с Джемой", dropChance: +a4 > 0 ? 0.5 : 0 },
      { text: "Доступ в Семью на месяц", dropChance: +a5 > 0 ? 3 : 0 },
      { text: "Сертификат в SPA", dropChance: +a6 > 0 ? 1 : 0 },
      { text: "Аудиопрактика (безлимит)", dropChance: 90 },
      { text: "Букет цветов", dropChance: +a8 > 0 ? 0.5 : 0 }
    ];

    function adjustChances() {
      if (commonPrizeCount >= 5) {
        prizes.forEach(prize => {
          if (prize.dropChance < 5) {
            prize.dropChance *= 2;
          }
        });
      }
    }

    function dropPrize(items) {
      adjustChances();
      const total = items.reduce((acc, item) => acc + item.dropChance, 0);
      const chance = Math.random() * total;
      let current = 0;
      for (let i = 0; i < items.length; i++) {
        if (current <= chance && chance < current + items[i].dropChance) {
          return i;
        }
        current += items[i].dropChance;
      }
      return items.length - 1;
    }

    function setSpinsCount() {
      availableSpins -= 1;
      dealSpins += 1;
      if (availableSpins <= 0) {
        isGetPrize = true;
        document.body.classList.add("no-spin");
      }
    }

    async function sendPrizeToBot(prizeIndex) {
      return await fetch("https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/callback", {
        method: "POST",
        body: JSON.stringify({
          message: `prize_${prizeIndex + 1}`,
          client_id: clientId
        })
      });
    }

    async function getUserVariables(id) {
      return await fetch(`https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/get_variables?client_id=${id}`)
        .then(body => body.json());
    }

    function showPrizePopup(index) {
      popupElem.classList.remove("hide");
      document.querySelector(`.prize-${index == "no-spin" ? index : index + 1}`).classList.remove("hide");
    }

    function onPhoneClick(e) {
      if (isGetPrize) {
        return;
      }
      isGetPrize = true;
      e.target.classList.add("active");
      const prizeId = dropPrize(prizes);

      if (prizes[prizeId].dropChance > 10) {
        commonPrizeCount++;
      }

      setTimeout(async () => {
        showPrizePopup(prizeId);
        showBackButton();
        await sendPrizeToBot(prizeId);
        setSpinsCount();
      }, 800);
    }

    phoneElems.forEach(el => {
      el.addEventListener("click", onPhoneClick);
    });
  }, 0);
})();
