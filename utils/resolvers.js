module.exports = {
    resolveLoanSchedules(data) {
        if (!data.num_of_collections) throw new Error("Scheduling service requires num_of_collections");
        if (!data.collection_frequency) throw new Error("Scheduling service requires collection frequency")
        if (!data.principal) throw new Error("Scheduling service requires principal (collection amount)")
        if (!data.interest) throw new Error("Scheduling service requires principal (collection amount)");
        if (!data.interest_per_period) throw new Error("Scheduling service requires interest_per_period (collection amount)");
        
        let milestones = {
            'monthly' : '1 month',
            'weekly' : '1 week',
            'bi-weekly': '1 week',
            'bi-monthly' : '1 month',
            'yearly': '1 year',
            'daily': '1 day'
        };
        let interest_milestones = {
            'per week': '1 week',
            'per month' :'1 month',
            e
        }
        let schedules = [];


        for (let i = 1; i < data.num_of_collections + 1; i++) {
            let scheduleObject = {};

            (parseFloat(data.interest) / 100) / 
            

        }
    },

    resolveInterest(baseamount, interest) {
        return (parseFloat(interest / 100) * parseFloat(baseamount))  + parseFloat(baseamount);
    },

    resolveCompletionStatus(object, required_fields, incomplete_status=false, complete_status=true) {
        let incomplete = false

        for (let i = 0; i < required_fields.length; i++) {
            if (!object[required_fields[i]]) {
                incomplete = true;
                break;
            }
        }
        return incomplete ? incomplete_status : complete_status
    }

    
}