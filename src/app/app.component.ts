import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {LoginPage} from "../pages/login/login";
import {TabsPage} from "../pages/tabs/tabs";
import {AuthService} from "../services/auth.service";
import {EstablishmentsService} from "../services/establishments.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";

// Para prueba de push notifications
import {Push} from '@ionic-native/push';
import { NotificationsService } from '../services/notifications.service';
import { AppStateService } from '../services/app-state.service';
import { DevicesService } from '../services/devices.service';
declare var FCMPlugin: any;

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = TabsPage;

    constructor(
        platform: Platform,
        statusBar: StatusBar,
        splashScreen: SplashScreen,
        public push: Push,
        public alert: AlertController,
        private authService: AuthService,
        private establishmentService: EstablishmentsService,
        public ga: GoogleAnalytics,
        private notificationsService: NotificationsService,
        private appStateService: AppStateService,
        private devices: DevicesService) {

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            window.alert('Platform is ready!');
            statusBar.styleDefault();
            splashScreen.hide();
        });

        this.vFHJ();
        this.validateSession();
        this.pushsetup();
    }

    validateSession(){
        let token = localStorage.getItem('id_token');
        let userSaved = localStorage.getItem('userLogged');

        if(token && userSaved){
            this.authService.userLogged = JSON.parse(userSaved);
            this.authService.establishmentId = this.authService.userLogged.establishmentId;
            this.authService.userId = this.authService.userLogged.id;

            this.establishmentService.establishmentsByUser = JSON.parse(localStorage.getItem('userEstablishments'));
            this.establishmentService.selectedEstablishmentId = localStorage.getItem('establishmentSelected');

            this.rootPage = TabsPage;
            this.verifyUser(this.authService.userLogged.email, this.authService.establishmentId);
        }
        else{
            this.rootPage = LoginPage;
        }
    }

    pushsetup() {
        if (typeof (FCMPlugin) != 'undefined') {
            FCMPlugin.onNotification(function (data) {
                console.log("\n", data, "\n hola \n");
                if (data.wasTapped) {
                    console.log(data);
                    //Notification was received on device tray and tapped by the user.
                    alert(JSON.stringify(data));
                } else {
                    //Notification was received in foreground. Maybe the user needs to be notified.
                    alert(JSON.stringify(data));
                }
            });
        }
    }

    vFHJ() {
        try{
            this.authService.vaff().subscribe(
                response => {
                    console.log('RESPONSE', response);
                }, err =>{
                    console.log('ERROR', err);
                    if(err.error){
                        let erro = err.error;
                        if (erro.msg === '4f89wef41ef8w118wef') {
                            if(localStorage.getItem('userLogged') != undefined || localStorage.getItem('userLogged') != null){
                                this.authService.logout();
                                console.log('IF-4f89wef41ef8w118wef');
                            }
                        }
                        else if (erro.msg === '748jfe7wefd5585d2') {
                            if(localStorage.getItem('userLogged') != undefined || localStorage.getItem('userLogged') != null){
                                this.authService.logout();
                                console.log('IF-748jfe7wefd5585d2');
                            }
                        }
                    }
                    else{
                        this.authService.logout();
                    }
                })
        }
        catch(e){
            console.log('Hay un error', e);
            this.authService.logout();
        }
    }

    verifyUser(email, establishmentId) {
        this.authService.verifyStatus({email, establishmentId})
            .subscribe(
                (success: any) => {
                    this.authService.statusPhysicalConditionsRegister =  success.data[0].statusPhysicalConditionsRegister;
                    this.authService.statusSchedule = success.data[0].statusSchedule;

                    localStorage.setItem('statusPhysicalConditionsRegister', success.data[0].statusPhysicalConditionsRegister);
                    localStorage.setItem('statusSchedule', success.data[0].statusSchedule);
                    localStorage.setItem('statusWaitingList', success.data[0].statusWaitingList);
                    localStorage.setItem('statusUploadPhotoProgress', success.data[0].statusUploadPhotoProgress);
                    localStorage.setItem('statusRatingLessons', success.data[0].statusRatingLessons);
                    localStorage.setItem('statusShareBD', success.data[0].shareBd);
                    localStorage.setItem('statusOnsitePaymentMembership', success.data[0].statusOnsitePaymentMembership);
                    localStorage.setItem('orgEstablishments', success.data[0].orgEstablishments);
                    localStorage.setItem('statusNews', success.data[0].statusNews);
                    localStorage.setItem('QR', success.data[0].QRApp);
                    localStorage.setItem('statusLimitMembershipTest', success.data[0].statusLimitMembershipTest);
                    localStorage.setItem('statusNotificationMobile', success.data[0].statusNotificationMobile);
                    if(success.data[0].statusNotificationMobile == 'Y'){
                      this.notificationsService.getUnreadNotifications()
                      .subscribe(
                          success => {
                            localStorage.setItem('unreadNotificationsCount', success.unread);
                            this.appStateService.setState({
                              notifications: {
                                unreadCount: success.unread
                            } });
                          },
                          error => {
                              let err = error.json();

                          });
                    }
                    this.ga.startTrackerWithId('UA-76827860-10')
                        .then(() => {
                            console.log('Google analytics is ready now');
                            this.ga.trackEvent('Usuario', 'recurrente', this.authService.userLogged.establishmentName + ' / ' + this.authService.establishmentId);
                        })
                        .catch(e => console.log('Error starting GoogleAnalytics', e));
                },
                error => {
                    let err = error.error;
                    if(err.title == 'USER_NO_FOUND') {
                        this.authService.logout();
                        this.rootPage = LoginPage;
                    }
                }
            )
    }

}
