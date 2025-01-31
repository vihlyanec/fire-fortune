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
    let { a1, a2, a3, a4, a5, a6, a7, a8, prizes: receivedPrizes } = userVariables;
    let availableSpins = userVariables.available_spins;
    let dealSpins = userVariables.deal_spins;
    let commonPrizeCount = 0;

    let prizes = [
      { key: "a1", text: "Книга «Говорим откровенно»", dropChance: +a1 > 0 ? 1 : 0 },
      { key: "a2", text: "Карты для пар", dropChance: +a2 > 0 ? 1 : 0 },
      { key: "a3", text: "Грант на программу «Shine BRIGHT»", dropChance: +a3 > 0 ? 3 : 0 },
      { key: "a4", text: "Личная консультация с Джемой", dropChance: +a4 > 0 ? 0.5 : 0 },
      { key: "a5", text: "Доступ в Семью на месяц", dropChance: +a5 > 0 ? 3 : 0 },
      { key: "a6", text: "Сертификат в SPA", dropChance: +a6 > 0 ? 1 : 0 },
      { key: "a7", text: "Аудиопрактика (безлимит)", dropChance: 90 },
      { key: "a8", text: "Букет цветов", dropChance: +a8 > 0 ? 0.5 : 0 }
    ];

    // Исключаем уже полученные призы из списка доступных
    prizes = prizes.filter(prize => !receivedPrizes.includes(prize.key));

    function adjustChances() {
      if (commonPrizeCount >= 5) {
        prizes.forEach(prize => {
          if (prize.dropChance < 5) {
            prize.dropChance *= 2;
          }
        });
      }
    }

    function dropPrize() {
      adjustChances();
      const total = prizes.reduce((acc, item) => acc + item.dropChance, 0);
      const chance = Math.random() * total;
      let current = 0;
      for (let i = 0; i < prizes.length; i++) {
        if (current <= chance && chance < current + prizes[i].dropChance) {
          return prizes[i];
        }
        current += prizes[i].dropChance;
      }
      return prizes[prizes.length - 1];
    }

    function setSpinsCount() {
      availableSpins -= 1;
      dealSpins += 1;
      if (availableSpins <= 0) {
        isGetPrize = true;
        document.body.classList.add("no-spin");
      }
    }

    async function sendPrizeToBot(prize) {
      return await fetch("https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/callback", {
        method: "POST",
        body: JSON.stringify({
          message: `prize_${prize.key}`,
          client_id: clientId
        })
      });
    }

    async function getUserVariables(id) {
      return await fetch(`https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/get_variables?client_id=${id}`)
        .then(body => body.json());
    }

    function showPrizePopup(prize) {
      popupElem.classList.remove("hide");
      document.querySelector(`.prize-${prize.key}`).classList.remove("hide");
    }

    function onPhoneClick(e) {
      if (isGetPrize) {
        return;
      }
      isGetPrize = true;
      e.target.classList.add("active");
      const prize = dropPrize();

      if (prize.dropChance > 10) {
        commonPrizeCount++;
      }

      setTimeout(async () => {
        showPrizePopup(prize);
        showBackButton();
        await sendPrizeToBot(prize);
        setSpinsCount();
      }, 800);
    }

    phoneElems.forEach(el => {
      el.addEventListener("click", onPhoneClick);
    });
  }, 0);
})();
