const mailBody = {
    getRegisterMail: (name) => {
        return (
            `<div>
                <h1>Hey ${name},</h1><br/>
                <h3>Thanks for signing up on <b>Find My Pet</b></h3>
                <h3>Ready to dive in? Login to your account using your email address and password to get started.</h3>
                <h3>Thanks !</h3>
                <h3><b>Find My Pet</b></h3>
            </div>`
        )
    },
    getContactMail: (name) => {
        return (
            `     <div>
                <h1>Hey ${name},</h1><br/>
                <h3>Thanks for contacting us</h3>
                <h3>Please keep in touch. Good luck with everything!<h3>
                <h3>Cheers,</h3>
                <h3><b>Find My Pet</b></h3>
            </div>`
        )
    },
    getLostPetMail: (payload) => {
        const { petId, personName, personEmail, personAddress, personPhone, personMessage, ownerName, petName, latitude, longitude } = payload;
        const locationURL = `https://admirable-torte-e51d6b.netlify.app/pet-map/${petId}$${latitude}&${longitude}`;
        return (
            `     <div>
                <h1>Hey ${ownerName},</h1><br/>
                <h3>Your pet ${petName} might have found to ${personName} at ${personAddress}</h3>
                <h3>You can contact him/her<h3>
                <h3>${personName}'s Info<h3>
                <h3>Email: ${personEmail}<h3>
                <h3>Phone no: ${personPhone}<h3>
                <h3>And ${personName} has also send message for you, </h3>
                <h3>${personName} said,</h3>
                <h3>${personMessage}</h3><br/>
                ${(latitude && longitude) && 
                `<div>
                    <h3>Also ${personName} share the location where he found ${petName}. You can check by clicking the link below:</h3>
                    <a href="${locationURL}" target="_blank">Locate ${petName}</a>
                </div>`
            }
                <h3><b>Find My Pet</b></h3>
            </div>`
        )
    },
    getHelpingMail: (payload) => {
        const { personName, ownerName, petName } = payload;
        return (
            `     <div>
                <h1>Hey ${personName},</h1><br/>
                <h3>Thanks for helping ${petName}</h3>
                <h3>${petName}'s owner ${ownerName} can contact you</h3>
                <h3>GOD BLESS YOU </h3>
                <h3>Thanks once again </h3><br/>
                <h3><b>Find My Pet</b></h3>
            </div>`
        )
    },
    placedOrderMail: (payload) => {
        const {orderDetails, name, paymentMethod } = payload;
        const { type, breed, price } = orderDetails;
        return (
            `     <div>
                <h1>Hey ${name},</h1><br/>
                <h3>Your order for ${breed} ${type} placed successfully</h3>
                <h3>Order Details: </h3>
                <h3>Type: ${type}</h3>
                <h3>Breed: ${breed}</h3>
                <h3>Price: ${price}</h3>
                <h3>Payment Method: ${paymentMethod}</h3><br/>
                <h3>Thanks for shopping </h3>
                <h3><b>Find My Pet</b></h3>
            </div>`
        )
    }
};

module.exports = mailBody;