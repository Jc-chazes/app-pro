import {Component} from '@angular/core';
import {NavController, Loading, LoadingController, AlertController} from 'ionic-angular';
import {SettingsPage} from "../settings/settings";
import {UserService} from "../../services/user.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

@Component({
    selector: 'page-password',
    templateUrl: 'password.html'
})
export class PasswordPage {

    loading: Loading;

    passwords: any = {
        currentPass : "",
        new1Pass : "",
        new2Pass : ""
    };

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private userService: UserService,
        public ga: GoogleAnalytics) {

        this.ga.startTrackerWithId('UA-76827860-10')
            .then(() => {
                console.log('Google analytics is ready now');
                this.ga.trackView('passwordPage');
            })
            .catch(e => console.log('Error starting GoogleAnalytics', e));

    }

    savePassword(){
        if(this.passwords.new1Pass.length > 0 || this.passwords.new2Pass.length > 0){
            if(this.passwords.new1Pass != this.passwords.new2Pass){
                let titleAlert = `<img src="assets/images/error.png" class="icon-booking"> <h6 class="title-booking">`+'Ups!'+`</h6>`;
                this.showAlert(titleAlert, 'La contraseña nueva no coincide en los dos campos, intente de nuevo por favor')
            }
            else{
                this.showLoading();
                let data = {
                    currentPasw: this.passwords.currentPass,
                    password: this.passwords.new1Pass
                };

                this.userService.changePassword(data)
                    .subscribe(
                        success =>{
                            this.loading.dismiss();

                            let titleAlert = "¡Bien!";
                            let messageAlert = "Tu contraseña se cambió satisfactoriamente";

                            let alert = this.alertCtrl.create({
                                title: `<img src="assets/images/success.png" class="icon-booking"> <h6 class="title-booking">`+titleAlert+`</h6>`,
                                message: messageAlert,
                                buttons: [
                                    { text: 'Ok',
                                        handler: () => {
                                            this.goToBack();
                                        }
                                    }
                                ]
                            });
                            alert.present();


                        },
                        error=>{
                            this.loading.dismiss();

                            let titleAlert = `<img src="assets/images/error.png" class="icon-booking"> <h6 class="title-booking">`+'Ups!'+`</h6>`;
                            let messageAlert = '';

                            let err = error.error;
                            switch (err.title) {
                                case "ERROR_DB_BODY":
                                    messageAlert = "Error de conexión";
                                    break;
                                case "Contraseña sin actualizar":
                                    messageAlert = "Ingrese correctamente la contraseña anterior";
                                    break;
                            }
                            this.showAlert(titleAlert, messageAlert);
                        }
                    )
            }
        }
        else{
            let titleAlert = `<img src="assets/images/error.png" class="icon-booking"> <h6 class="title-booking">`+'Ups!'+`</h6>`;
            this.showAlert(titleAlert, 'Complete los campos por favor.');
        }

    }

    goToBack(){
        this.navCtrl.popTo(SettingsPage);
    }

    showLoading() {
        this.loading = this.loadingCtrl.create({
            content: 'Un momento...'
        });
        this.loading.present();
    }

    showAlert(title, message){
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [{
                text: 'Ok',
                handler: () => {this.passwords = {currentPass:"", new1Pass:"", new2Pass: ""}}
            }]
        });
        alert.present();
    }

}
