const schedule = require('node-schedule');
class Scene{
    constructor(mqtt_client,device){
        this.mqtt_client=mqtt_client
        this.device=device
        this.condition_on=false
        this.interval=undefined
    }
    action(startdate,enddate){
        const rule = new schedule.RecurrenceRule();
        rule.minute = 22;
        rule.hour = 21;
        const device=this.device
        const mqtt_client=this.mqtt_client
        const job = schedule.scheduleJob(rule, function(){
            console.log('Event schedule');
            device.change_power_state(mqtt_client,'1','TOGGLE')
          });
    }
    destroyAction(){
        clearInterval(this.interval)
    }
    

}
module.exports=Scene