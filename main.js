(() => {
  setTimeout(async () => {
    const tg = window.Telegram?.WebApp;
    if (tg) tg.expand();

    function showBackButton() {
      if (!tg) return;
      tg?.MainButton.setText("Забрать подарок").show().onClick(() => {
        tg.close();
        webviewClose();
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const clientId = +urlParams.get("id") || 1545106315;
    
    const userVariables = await getUserVariables(clientId);
    let isGetPrize = userVariables ? false : true;
    let { a1, a2, a3, a4, a5, a6, a7, a8 } = userVariables;
    let availableSpins = userVariables.available_spins;
    let dealSpins = userVariables.deal_spins;
    
    const usedPrizes = userVariables.prizes || [];
    
    const prizes = [
      { text: "Напечатанный Ежедневник", dropChance: +a1 > 0 ? 5 : 0 },
      { text: "Карты для пар", dropChance: +a2 > 0 ? 8 : 0 },
      { text: "Скидка 50% на курс «Говорим откровенно»", dropChance: +a3 > 0 ? 7 : 0 },
      { text: "Консультация с Джемой", dropChance: +a4 > 0 ? 1 : 0 },
      { text: "Доступ в Семью на месяц для вас или вашего друга", dropChance: +a5 > 0 ? 7 : 0 },
      { text: "Сертификат в SPA", dropChance: +a6 > 0 ? 5 : 0 },
      { text: "Видео про коммуникацию (безлимит)", dropChance: 35 },
      { text: "Офлайн встреча в Москве с Джемой", dropChance: +a8 > 0 ? 35 : 0 },
    ];
    
    function filterAvailablePrizes(items, usedPrizes) {
      return items.map((item, index) => usedPrizes.includes(`a${index + 1}`) ? { ...item, dropChance: 0 } : item);
    }

    function lerp(min, max, value) {
      return (1 - value) * min + value * max;
    }

    function dropPrize(items) {
      const filteredPrizes = filterAvailablePrizes(items, usedPrizes);
      const total = filteredPrizes.reduce((acc, item) => acc + item.dropChance, 0);
      const chance = lerp(0, total, Math.random());

      let current = 0;
      for (let i = 0; i < filteredPrizes.length; i++) {
        if (current <= chance && chance < current + filteredPrizes[i].dropChance) {
          return i;
        }
        current += filteredPrizes[i].dropChance;
      }
      return -1;
    }
    
    if (availableSpins <= 0) {
      isGetPrize = true;
      document.body.classList.add("no-spin");
      showPrizePopup("no-spin");
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
      return await fetch(
        "https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/callback",
        {
          method: "POST",
          body: JSON.stringify({
            message: `приз_${prizeIndex + 1}`,
            client_id: clientId,
          }),
        }
      );
    }

    async function getUserVariables(id) {
      return await fetch(
        `https://chatter.salebot.pro/api/da37e22b33eb13cc4cabaa04dfe21df9/get_variables?client_id=${id}`
      ).then((body) => body.json());
    }

    function showPrizePopup(index) {
      popupElem.classList.remove("hide");
      document.querySelector(`.prize-${index == "no-spin" ? index : index + 1}`).classList.remove("hide");
      console.log(prizes[index]);
    }

    function onPhoneClick(e) {
      if (isGetPrize) return;
      isGetPrize = true;
      e.target.classList.add("active");

      let prizeId = dropPrize(prizes);
      if (prizeId === -1) {
        alert("Все возможные призы уже были выиграны!");
        return;
      }

      setTimeout(async () => {
        showPrizePopup(prizeId);
        showBackButton();
        await sendPrizeToBot(prizeId);
        setSpinsCount();
      }, 800);
    }

    phoneElems.forEach((el) => {
      el.addEventListener("click", onPhoneClick);
    });
  }, 0);
})();
