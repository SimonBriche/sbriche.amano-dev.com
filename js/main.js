/**
 * application principale
 *
 */
window.app = {
    realXML: null,
    showReal: function(id){
        var xml = $(this.realXML).find("realisations realisation[id="+id+"]");
        var scope = angular.element(document.getElementById("myModal")).scope();
        scope.$apply(function(){ 
            scope.setTitle(id);
            scope.setReal(xml);
        });
        
        $('#myModal').modal('show');
    },
    initFlash: function(){
        var flashvars = {};
        flashvars.protocol = document.location.protocol;

        var params = {};
        params.allowscriptaccess = "always";
        params.menu = "false";
        params.scale = "noscale";

        var attributes = {};
        attributes.id = "site";
        attributes.name = "site";

        swfobject.embedSWF("swf/loader.swf", "flash_content", "100%", "100%", "10.1", "swf/expressInstall.swf", flashvars, params, attributes, app.alertStatus);
    },
    alertStatus: function(e) {
        if(e.success){
            //flash on !
            swffit.fit("site", 960,560);
        }
        else{
            //no flash player
        }
    },
    detectRetina: function(){
        console.log("launch detection");
        var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                (min--moz-device-pixel-ratio: 1.5),\
                (-o-min-device-pixel-ratio: 3/2),\
                (min-resolution: 1.5dppx)";
        if (window.devicePixelRatio > 1)
            return true;
        if (window.matchMedia && window.matchMedia(mediaQuery).matches)
            return true;
        return false;
    },
    isRetina: function(){
        if(this.cacheRetina === null)
            this.cacheRetina = this.detectRetina();
        return this.cacheRetina;
    },
    cacheRetina:null
}

//force HTML manually or for mobile device that support flash
if(window.location.href.indexOf("forceHTML") == -1 && window.innerWidth > 768){
    app.initFlash();
}
/**
 * gestion du modal de réalisation
 *
 */
var myModule = angular.module('realModule', ['ngSanitize']).controller('realController', function($scope) {
    $scope.setTitle = function(title) {
        $scope.realTitle = title;
    };
    //injection des informations concernant la réalisation
    $scope.setReal = function (xml){
        console.log(xml);
        $(xml).each(function(){
            $scope.titre = $(this).find("titre").text();
            $scope.description = $(this).find("description").text();
            $scope.technos = $(this).find("technos").text();
            $scope.link = $(this).find("link").text();
            if($scope.link) $("#btTest").show(); else $("#btTest").hide();
            $scope.folder = $(this).find("folder").text();
            var imageList = [];
            $(this).find("images image").each(function(){
                console.log($(this).text());
                imageList.push({src:$(this).text()});
            });
            $scope.images = imageList;
        });
    },
    $scope.images = [{src:"default.jpg"}],
    $scope.folder = "default"
});


//document ready
$(document).ready(function() {
    /**
     * génération des galleries et mise en mémoire du XML de réalisation
     *
     */
    $.ajax({
        type: "GET",
        url: "xml/real.xml",
        dataType: "xml",
        success: function(xml) {
            
            app.realXML = xml;
            $(app.realXML).find("galleries gallery").each(function(){
                var gallery = "#"+$(this).attr('id')+" ul";
                if($(gallery).length != 0){
                    $(gallery).empty();
                    
                    $(this).find("realisation").each(function(){
                        var real = $(app.realXML).find("realisations realisation[id="+$(this).attr('id')+"]");
                        var mini = $(real).find("mini").text();
						var title = $(real).find("short_description").text();
                        if(app.isRetina()) mini = mini.replace(/\.\w+$/, function(match) { return "@2x" + match; });
                        var folder = $(real).find("folder").text();
                        $(gallery).append(
                            $('<li></li>').append(
                                $('<img/>', {
                                    "class": 'img-thumbnail',
                                    src: "images/"+folder+"/"+mini,
									title: title,
                                    "data-real":$(this).attr('id'),
                                    on: {
                                         click:function(event){
                                             app.showReal($(this).attr('data-real'));
                                            }
                                        }
                                })
                            )
                        );
                    });
                }
                else{
                    console.log("gallery "+gallery+" not found");
                }
                
            });
        }// /success
    });// /ajax
    
    /**
     * gestion du formulaire
     *
     */
    var formMessages = {
        nom: "Le nom est obligatoire.",
        prenom: "Le pr&eacute;nom est obligatoire.",
        email: {
          required: "L'email est obligatoire.",
          email: "Cet email est incorrect."
        },
        message: "Le message est obligatoire.",
        args_missing:"Veuillez remplir tous les champs obligatoires.",
        unexpected:"Une erreur inattendue s'est produite."
    };
    $("#form-contact").validate({
        debug: false,
        rules: {
            nom: {
              minlength: 2,
              required: true
            },
            prenom: {
              minlength: 2,
              required: true
            },
            email: {
              required: true,
              email: true
            },
            message: {
              minlength: 2,
              required: true
            }
        },
        messages:formMessages,
        submitHandler: function (form) {
            $('#bt-submit').prop('disabled', true);
            var jqxhr = $.post( "mailer.php", $("#form-contact").serialize(), null, "json")
              .done(function(data) {
                if(data.error != "0"){
                    var errorMessage;
                    switch(data.error){
                        case "email_incorrect":
                            errorMessage = formMessages.email.email;
                        break;
                        case "args_missing":
                            errorMessage = formMessages.args_missing;
                        break;
                        case "unexpected":
                            errorMessage = formMessages.unexpected;
                        break;
                    }
                    $("#form-contact-error").html(errorMessage);
                    $("#contact .alert-danger").removeClass("hidden");
                    $("#contact .alert-danger").hide().fadeIn('slow').delay(1500).fadeOut("slow");
                }
                else{
                    document.getElementById("form-contact").reset();
                    $("#contact .alert-success").removeClass("hidden");
                    $("#contact .alert-success").hide().fadeIn('slow').delay(1500).fadeOut("slow");
                }
              })
              .fail(function() {
                $("#contact .alert-danger").removeClass("hidden");
                $("#contact .alert-danger").hide().fadeIn('slow').delay(1500).fadeOut("slow");
              })
              .always(function() {
                $('#bt-submit').prop('disabled', false);
            });
        },
        errorClass: 'has-error',
        validClass: 'has-success',
        ignore: "",
        highlight: function (element, errorClass, validClass) {
          $(element).closest('.form-group').removeClass(validClass).addClass(errorClass);
          $(element).closest('.form-group').find('.form-control-feedback').removeClass('glyphicon-ok').addClass('glyphicon-remove');
            
        },
        unhighlight: function (element, errorClass, validClass) {
          $(element).closest('.form-group').removeClass(errorClass).addClass(validClass);
          $(element).closest('.form-group').find('.help-block').text('');
          $(element).closest('.form-group').find('.form-control-feedback').removeClass('glyphicon-remove').addClass('glyphicon-ok');
        },
        errorPlacement: function (error, element) {
          $(element).closest('.form-group').find('.help-block').text(error.text());
        }
     });// /gestion formulaire
    
});// /ready

function disableSWFAddressTracking(){
}