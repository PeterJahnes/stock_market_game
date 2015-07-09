var toggleTradeForm, clearTradeForm, updateSidebarStock, createStockDiv, updateBankAccountHtml, dollarAttributes, makeTrade, sellStock, buyStock, updateStock, newStock, myBankAccount, offset, offsetCheck, marketOpenCheck, updateAllStocks, loadGame, saveGame, signup, login, logout

myBankAccount = new BankAccount(10000);

toggleTradeForm = function(type) {
	if ( $('#buy_sell_button').val()===type ){
		if ( $('#sidebar_new_stock_search').is(":visible") ){
			$('#sidebar_new_stock_search').hide();
		} else {
			$('#sidebar_new_stock_search').show();
		};
	} else {
		$('#buy_sell_button').val(type);
		$('#sidebar_new_stock_search').show();
	};
};

clearTradeForm = function() {
	$('#sidebar_get_stock_type').val("");
	$('#sidebar_get_stock_amount').val("");
};

createStockDiv = function(myNewStock) {
	var newClass = 'row stock_view '+myNewStock.symbol.toLowerCase();
	var newClassSelector = '.'+myNewStock.symbol.toLowerCase();
	$('#sidebar').append($('#sample').html());
	$('#sidebar').children('div').last().attr('class', newClass);
	updateSidebarStock(myNewStock);
	$(newClassSelector).show();
};

updateSidebarStock = function(stock) {
	var  newClassSelector = '.'+stock.symbol.toLowerCase();
	$.each(stock, function(type,value){
		if (stock.hasOwnProperty(type)){
			$(newClassSelector+' .'+type).html(dollarAttributes(type)+value);
		};
	});
	// $(newClassSelector+' .symbol').html(symbol);
	// $(newClassSelector+' .amount').html(amount);
	// $(newClassSelector+' .priceBought').html(thePrice);
	// $(newClassSelector+' .currentPrice').html(thePrice);
	// $(newClassSelector+' .currentValue').html(Math.round(amount*thePrice));
	// $(newClassSelector+' .gainLoss').html("0");
};

updateBankAccountHtml = function() {
	$('#bank_cash').text("$"+myBankAccount.cash.toFixed(2))
	$('#bank_stock_value').text("$"+myBankAccount.stockValue.toFixed(2))
	$('#bank_total').text("$"+(parseFloat(myBankAccount.cash)+parseFloat(myBankAccount.stockValue)).toFixed(2))
};

accountModalOpen = function(type) {
	$("#account_modal").foundation('reveal', 'open');
	accountModalTypeSelect(type);
};

accountModalTypeSelect = function(type) {
	if (type === "login") {
		$("#account_modal_login").show();
		$("#account_modal_signup").hide();
	} else if (type === "signup") {
		$("#account_modal_login").hide();
		$("#account_modal_signup").show();
	};
};

dollarAttributes = function(atty){
	var dollarAttys = {"priceBought":1,"currentPrice":1,"currentValue":1, "gainLoss":1};
	if (dollarAttys[atty]) {
		return "$"
	} else {
		return ""
	};
};

offsetCheck = function(){
	$.ajax({
	  url: "/stock_market_game/offset",
	  dataType: "json"
  }).done(function(offsetData){
  	offset = offsetData.offset;
  });
};

marketOpenCheck = function(){
	var offsetHours = offset / 3600; 
	d = new Date;
	var newYorkTime = d.getUTCHours() + offsetHours;
	var dayOfWeek = d.getUTCDay();
	if (newYorkTime>9 && newYorkTime<16 && dayOfWeek!=0 && dayOfWeek!=6) {
		updateAllStocks();
	};
};

updateAllStocks = function() {
	if (Object.keys(myBankAccount.myOwnedStock).length>0){
		$.support.cors = true;
		var theStocks = '"' + Object.keys(myBankAccount.myOwnedStock).join('","') + '"';
		var theUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20("+theStocks+")&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=updateStocks";
		$.ajax({
		  url: theUrl,
		  dataType: "jsonp",
	    jsonp: "callback",
	    jsonpCallback: "updateStocks"
	  });
	  updateStocks = function(data){
	  	var stocksData = data.query.results.quote;
	  	$.each(stocksData, function(index,stock){
	  		myBankAccount.myOwnedStock[stock.symbol].updatePrice(stock.LastTradePriceOnly);
	  		updateSidebarStock(myBankAccount.myOwnedStock[stock.symbol]);
	  	});
	  	console.log("all updated")
	  };
	};
};

loadGame = function() {
	$.ajax({
	  url: "/stock_market_game/load",
	  dataType: "json"
  }).done(function(loadedGame){
  	if (loadedGame['stat'] === true) {
  		game = $.parseJSON(loadedGame["game"]);
  		myBankAccount = new BankAccount(game["cash"])
			updateBankAccountHtml();
  		$.each(game.myOwnedStock, function(symbol,stock){
		  	var myNewStock = new OwnedStock(stock["symbol"], stock["amount"], stock["priceBought"]);
				myBankAccount.myOwnedStock[symbol] = myNewStock;
				createStockDiv(myNewStock);
  		});
			updateAllStocks();
  		// showSaveWarningToggle();
  	} else {
  		// showSaveWarningToggle();
  	}
  	console.log(loadedGame)
  }).fail(function(loadedGame){
  	console.log('failed');
  	console.log(loadedGame);
  });
};

saveGame = function() {
	$.ajax({
	  url: "/stock_market_game/save",
	  dataType: "json",
	  method: "POST",
	  data: { game: { saved_game: JSON.stringify(myBankAccount) }}
	}).done(function(saveMessage){
  	console.log("game saved" + saveMessage);
  }).fail(function(saveMessage){
  	console.log("game save failed" + saveMessage);
  });
};

signup = function(response) {
	$('#user_profile_link').text(response["name"]);
	$('.user_links').toggle();
	$('.stock_view').remove();
	$("#account_modal").foundation('reveal', 'close');
};

login = function(response) {
	$('.stock_view').remove();
	$('#user_profile_link').text(response["name"]);
	$('.user_links').toggle();
	$('.stock_view').remove();
	loadGame();
	$("#account_modal").foundation('reveal', 'close');
};

logout = function() {
	$.ajax({
	  url: "/logout",
	  dataType: "json",
	}).done(function(saveMessage){
		$('#user_profile_link').text("no user");
		$('.user_links').toggle();
		myBankAccount = new BankAccount(10000);
		updateBankAccountHtml();
		$('.stock_view').remove();
  }).fail(function(saveMessage){
  	console.log("logout failed");
  });
};



makeTrade = function(symbol,amount,callback) {
	$.support.cors = true;
	var theUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%3D%22"+symbol+"%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="+callback;
	$.ajax({
	  url: theUrl,
	  dataType: "jsonp",
    jsonp: "callback",
    jsonpCallback: "updateStocks"
  });	
	newStock = function(data) {
		var thePrice = data.query.results.quote.LastTradePriceOnly;
		if (thePrice === null){
			alert('that is not a valid stock')
		} else if (thePrice*amount<myBankAccount.cash) {
		  var myNewStock = new OwnedStock(symbol, amount, thePrice);
			myBankAccount.myOwnedStock[symbol.toLowerCase()] = myNewStock;
			myBankAccount.updateCash(((amount*thePrice)*-1).toFixed(2));
			createStockDiv(myNewStock);
			myBankAccount.updateStockValue();
			updateBankAccountHtml();
			saveGame();
		} else {
			alert('you dont have that much cash')
		};
	};
	updateStock = function(data) {
	  var updateThePrice = data.query.results.quote.LastTradePriceOnly;
	  var updateTheStock = myBankAccount.myOwnedStock[symbol.toLowerCase()];
	  updateTheStock.updatePrice(updateThePrice);
		updateSidebarStock(updateTheStock);
	};
	buyStock = function(data) {
	  var thePrice = data.query.results.quote.LastTradePriceOnly;
		if (thePrice*amount<myBankAccount.cash) {
		  var theStock = myBankAccount.myOwnedStock[symbol.toLowerCase()];
		  theStock.buyPrice(amount,thePrice);
			updateSidebarStock(theStock);
		} else {
			alert('you dont have that much cash')
		};
		saveGame();
	};
	sellStock = function(data) {
	  var theStock = myBankAccount.myOwnedStock[symbol.toLowerCase()];
		var thePrice = data.query.results.quote.LastTradePriceOnly;
	  if (theStock.amount + amount > 0 ) {
		  theStock.sellPrice(amount,thePrice);
		} else if (theStock.amount + amount < 0) {
			alert('you dont have that many shares');
		} else {
			confirm('do you want to sell all of '+symbol.toUpperCase());
		  theStock.sellPrice(amount,thePrice);
			$('.'+symbol).hide();
		};
		updateSidebarStock(theStock);
		saveGame();
	};
}

$(document).on("ready page:load", function() {
	$("#stock_market_info_modal").foundation('reveal', 'open');
	$('#buy_stock_link').on('click', function(event){
		event.preventDefault();
		clearTradeForm();
		toggleTradeForm("Buy");
	});
	$('#sell_stock_link').on('click', function(event){
		event.preventDefault();
		clearTradeForm();
		toggleTradeForm("Sell");
	});
	$('#sidebar_get_stock').submit(function(event){
		event.preventDefault();
		var symbol, amount
		symbol = $('#sidebar_get_stock_type').val().toLowerCase();
		amount = $('#sidebar_get_stock_amount').val();
		clearTradeForm();
		toggleTradeForm($('#buy_sell_button').val());
		if (!myBankAccount.myOwnedStock[symbol]){
			makeTrade(symbol,amount,'newStock');
		} else if( $('#buy_sell_button').val()==="Sell" ) {
			makeTrade(symbol,-Math.abs(amount),'sellStock');
		} else if( $('#buy_sell_button').val()==="Buy") {
			makeTrade(symbol,amount,'buyStock');
			$('.'+symbol).show();
		};
	});
	$('#login_form').submit(function(event){
		event.preventDefault();
		$contact_data = $(event.target);
		$.ajax({
      url: $contact_data.attr("action"),
      type: $contact_data.attr("method"),
      data: $contact_data.serialize(),
      dataType: 'json'
    }).done(function(response) {
    	login(response);
    });
	});
	$('#signup_form').submit(function(event){
		event.preventDefault();
		$contact_data = $(event.target);
		$.ajax({
      url: $contact_data.attr("action"),
      type: $contact_data.attr("method"),
      data: $contact_data.serialize(),
      dataType: 'json'
    }).done(function(response) {
    	signup(response);
    });
	});
  $(document).keydown(function(e){
    if(e.keyCode === 32){
      e.preventDefault();
			toggleTradeForm("Buy");
    };
  });
	$(document).on('click', '.buy_stock_link', function(event){
		event.preventDefault();
		var symbol = $(this).parent().parent().children().first().text().toLowerCase();
		$('#sidebar_get_stock_type').val(symbol);
		toggleTradeForm("Buy");
	});
	$(document).on('click', '.sell_stock_link', function(event){
		event.preventDefault();
		var symbol = $(this).parent().parent().children().first().text().toLowerCase();
		$('#sidebar_get_stock_type').val(symbol);
		toggleTradeForm("Sell");
	});
	$(document).on('click', '#logout_link', function(event){
		event.preventDefault();
		logout();
	});
	$(document).on('click', '#login_link', function(event){
		event.preventDefault();
		accountModalOpen("login");
	});
	$(document).on('click', '#signup_link', function(event){
		event.preventDefault();
		accountModalOpen("signup");
	});
	loadGame();
	offsetCheck();
	var offsetChecker = setInterval(offsetCheck,32400000);
	var updateInterval = setInterval(marketOpenCheck,10000);
});

function OwnedStock(symbol, amount, priceBought){
	this.symbol = symbol.toUpperCase();
	this.amount = parseFloat(amount);
	this.priceBought = parseFloat(priceBought).toFixed(2);
	this.currentPrice = parseFloat(priceBought).toFixed(2);
	this.currentValue = parseFloat(priceBought*amount).toFixed(2);
	this.gainLoss = (0.00).toFixed(2);
	// update OwnedStock
};

OwnedStock.prototype.updatePrice = function(price){
	this.currentPrice = parseFloat(price).toFixed(2);
	this.currentValue = parseFloat(this.amount * price).toFixed(2);
	this.gainLoss = parseFloat(this.currentValue - (this.amount * this.priceBought)).toFixed(2);
	// update account
	myBankAccount.updateStockValue(price);
};

OwnedStock.prototype.buyPrice = function(addedAmount, price){
	var oldPrice = this.priceBought;
	var oldAmount = this.amount;
	this.amount += parseFloat(addedAmount);
	this.priceBought = parseFloat(((oldPrice * oldAmount)+(price * addedAmount))/this.amount).toFixed(2);
	this.currentPrice = parseFloat(price);
	this.currentValue = parseFloat(this.amount * price).toFixed(2);
	this.gainLoss = parseFloat(this.currentValue - (this.amount * this.priceBought)).toFixed(2);
	// update account
	myBankAccount.updateCash((addedAmount*price)*-1);
};

OwnedStock.prototype.sellPrice = function(removedAmount, price){
	this.amount += parseFloat(removedAmount);
	this.currentPrice = parseFloat(price);
	this.currentValue = parseFloat(this.amount * price).toFixed(2);
	this.gainLoss = parseFloat(this.currentValue - (this.amount * this.priceBought)).toFixed(2);
	// update account
	myBankAccount.updateCash((removedAmount*price)*-1);
};

function BankAccount(cash){
	this.cash = parseFloat(cash);
	this.stockValue = parseFloat(0.00);
	this.myOwnedStock = {};
};

BankAccount.prototype.updateCash = function(cashAmount){
	this.cash += parseFloat(cashAmount);
	this.updateStockValue();
	updateBankAccountHtml();
};

BankAccount.prototype.updateStockValue = function(){
	this.stockValue = parseFloat(0);
	that = this
	$.each(this.myOwnedStock, function(symb,obj){
		that.stockValue += parseFloat(obj.currentValue);
	});
	updateBankAccountHtml();
};