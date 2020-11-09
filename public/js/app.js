(function ($) {
    var tokenContractAddress = 'TYLrbh1pVcx95bop33XQ1iYdh7r3ogEQ8Q';
    var stakingContractAddress = 'TQfKWr7a1mtNhPRUdcqq7mya56wCFDu3Hp';
    var tokenContract = null;
    var stakingContract = null;
    var bonus = 0;


    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };

    function generateTimer(diff , id){
          // get total seconds between the times
          var delta = Math.abs(diff) / 1000;

          // calculate (and subtract) whole days
          var days = Math.floor(delta / 86400);
          delta -= days * 86400;

          // calculate (and subtract) whole hours
          var hours = Math.floor(delta / 3600) % 24;
          delta -= hours * 3600;

          // calculate (and subtract) whole minutes
          var minutes = Math.floor(delta / 60) % 60;
          delta -= minutes * 60;

          // what's left is seconds
          var seconds = delta % 60;  // in theory the modulus is not required

          $(id).text( days + ' Days ' + hours + ' Hours ' + minutes + ' Minutes ' + seconds.toFixed(0) + ' Sec ')
    }

    var ref = getUrlParameter('ref');

    if(ref){
        localStorage.setItem('ref', ref);
    }
    
    ref = localStorage.getItem('ref');

   
    setInterval(function(){
        window.tronWeb.event.getEventsByContractAddress(stakingContractAddress, {size : 100}).then(function(r){
            $("#history tbody").empty();

            var content = '';

            r.forEach(function(o, index){
                if(o.name == 'onTokenStake' || o.name == 'onTokenUnstake' || o.name == 'onWithdraw'){ 

                    content += '<tr>';
                    content += '<td><a href="https://tronscan.org/#/transaction/' + o.transaction + '" target="_blank">' + new Date(o.timestamp).toLocaleString(); + '</a></td>';
                     content += '<td>' + tronWeb.address.fromHex(o.result.customerAddress) + '</td>';
                    if(o.name == 'onTokenStake') content += '<td style="color: #3AFF89 !important;"> +' +  (o.result.incomingCNR/1e8).toFixed(2) + '</td>';
                    if(o.name == 'onTokenUnstake') content += '<td style="color: #F27E4C !important;"> -' +  (o.result.tokensBurned/1e8).toFixed(2) + '</td>';
                    if(o.name == 'onWithdraw') content += '<td style="color: #F27E4C !important;"> -' +  (o.result.cnrWithdrawn/1e8).toFixed(2) + '</td>';

                    content += '</tr>';
                }
            });
    
            $('#history > tbody:last-child').append(content)

          });
    },5000)

    var chartCompiled = false;
    setInterval(function(){
        if(window.tronWeb && !tokenContract){
            window.tronWeb.contract().at(tokenContractAddress).then(function(c){
                tokenContract = c;
            });   
        }
        if(window.tronWeb && !stakingContract){
            window.tronWeb.contract().at(stakingContractAddress).then(function(c){
                stakingContract = c;
            });   
        }

        if(tokenContract){
            tokenContract.balanceOf(stakingContractAddress).call().then(function(r){
                $("#contract-balance").text((r/1e8).toFixed(2));

                if(chartCompiled) return;

                chartCompiled = true;
                $.ajax('/api/balances',   // request url
                {
                    success: function (data, status, xhr) {// success callback function
        
                        var labels = [];
                        var balances = [];
                       data.forEach(function(o){
                            labels.push(new Date(o.date).toLocaleString('en-GB',{month: 'long', day: 'numeric'}));
                            balances.push(o.balance);
                       })

                       labels = labels.reverse();
                       balances = balances.reverse();
                       labels.push(new Date().toLocaleString('en-GB',{month: 'long', day: 'numeric'}))
                       balances.push(r/1e8);
                         //our chart
                    var ctx = document.getElementById("myChart").getContext('2d');
                    var myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Series 1', // Name the series
                                data: balances, // Specify the data values array
                                fill: true,
                                borderColor: '#00be99', // Add custom color border (Line)
                                backgroundColor: 'rgba(0, 190, 153, 0.03)', // Add custom color background (Points and Fill)
                                borderWidth: 2, // Specify bar border width
                                pointBackgroundColor: 'white'
                            }]},
                        options: {
                          responsive: true, // Instruct chart js to respond nicely.
                          maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
                        }
                    });
                    }
                });
            }); 
            tokenContract.balanceOf(window.tronWeb.defaultAddress.base58).call().then(function(r){
                $("#my-balance").text((r/1e8).toFixed(2));
            }); 
            tokenContract.allowance(window.tronWeb.defaultAddress.base58,stakingContractAddress).call().then(function(r){
                if(r/1e8 > 0){
                    $("#approve-btn").addClass("btn-disabled");
                    $("#stake-btn").removeClass("btn-disabled");
                }else{
                    $("#stake-btn").addClass("btn-disabled");
                    $("#approve-btn").removeClass("btn-disabled");
                }
            }); 
            stakingContract.getVariousInfo().call().then(function(r){
                $("#bonus-reward-pool").text((r[1]/1e8).toFixed(2));
                
                bonus = (r[1]/1e8)*0.4;
                $("#bonus-leaderboad").text(bonus.toFixed(2))
                var now = new Date();
                var diff = r[0]*1000 - now.getTime();

                if(diff > 0){
                    generateTimer(diff , '#bonus-timer');
                }else{
                    generateTimer(0 , '#bonus-timer');
                }
               

                $("#monthly-reward-pool").text((r[3]/1e8).toFixed(2));
             
                var diff = r[2]*1000 - now.getTime();
                if(diff > 0){
                    generateTimer(diff , '#monthly-timer');
                }else{
                    generateTimer(0 , '#monthly-timer');
                }
            });

            stakingContract.getStakeInfoOf(window.tronWeb.defaultAddress.base58).call().then(function(r){
                $("#my-stake").text((r[2]/1e8).toFixed(2));
                $("#my-stake-2").text((r[2]/1e8).toFixed(2));

                if(r[0] > 0) $("#my-percent-stake").text(((100 * (r[2]/1e8)) / (r[0]/1e8)).toFixed(2));
                else $("#my-percent-stake").text('0');

                $("#total-player").text(r[1]);
                $("#my-divs").text((r[3]/1e8).toFixed(2));
                $("#my-ref-divs").text((r[4]/1e8).toFixed(2));

                $("#my-rewards").text(((r[3]/1e8) + (r[4]/1e8)).toFixed(2));

            });

            stakingContract.getLeaderboard().call().then(function(r){
                $("#leaderboard tbody").empty();

                var content = '';
                var pos = 0;
            
                for(var index = 0 ; index <= 9 ; index++){
                    pos++;
                    content += '<tr>';
                    content += '<td>' + pos + '</td>';
                    content += '<td>' + tronWeb.address.fromHex(r[0][index]) + '</td>';
                    content += '<td>' +  (r[2][index]/1e8).toFixed(0) + '</td>';
                    content += '<td>' + (bonus/10).toFixed(2) + '</td>';
                    content += '</tr>';
                }

                $('#leaderboard > tbody:last-child').append(content)
            });

        }
    },1000)




    $( "#approve-btn" ).click(function() {
        tokenContract.approve(stakingContractAddress,'10000000000000000000000').send({
            feeLimit:10000000
        });
    });

    $( "#stake-btn" ).click(function() {
        var amountToStake = $("#amountToStake").val();
        if(!ref){
            ref = window.tronWeb.defaultAddress.base58;
        }
        if(amountToStake > 0){
            stakingContract.stake(ref,amountToStake*1e8).send({
                feeLimit:10000000
            });
        }
    });

    $( "#unstake-btn" ).click(function() {
        var amountToUnStake = $("#amountToUnStake").val();
        if(amountToUnStake > 0){
            stakingContract.unstake(amountToUnStake*1e8).send({
                feeLimit:10000000
            });
        }
        
    });

    $( "#restake-btn" ).click(function() {
        stakingContract.roll().send({
            feeLimit:10000000
        });
    });

    $( "#withdraw-btn" ).click(function() {
        stakingContract.withdraw().send({
            feeLimit:10000000
        });
    });



})(jQuery);
