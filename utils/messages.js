module.exports.setupMessages = {
    initialMessage: `Welcome to Vaccine Buddy\\. Happy to assist you with booking your vaccination slot\\. I will be collecting the following details before assisting you:

    1\\. *Phone Number* \\- _For authentication purposes_
    2\\. *Vaccination Date* \\- _To filter slots by date_
    3\\. *Dose No* \\- _To filer slots by dose number_
    4\\. *Age* \\- _To filter slots by minimum age_
    5\\. *Cost* \\- _To filter slots by cost of vaccine \\(Free vs Paid\\)_
    6\\. *State* \\- _To filter slots by state_
    7\\. *District* \\- _To filter slots by district_
    8\\. *Vaccines* \\- _To filter by preferred vaccine\\(s\\)_
    9\\. *Beneficiaries* \\- _To identify members on your Cowin portal for the booking_
    
    While I will walk you through the steps one\\-by\\-one, you can change these preferences anytime by using the following commands:
    
    1\\. \`/date\` \\- _To change your vaccination search start date_
    2\\. \`/dose\` \\- _To change your vaccination dose number_
    3\\. \`/age\` \\- _To change your age filter_
    4\\. \`/cost\` \\- _To change your cost filter_
    5\\. \`/state\` \\- _To change your state of residence_
    6\\. \`/district\` \\- _To change your district of residence_
    7\\. \`/vaccines\` \\- _To change your preferred vaccines_
    8\\. \`/beneficiaries\` \\- _To change the relevant beneficiaries_
        
    Hope I am able to assist you\\! Let's begin\\!`,
    phoneNumberMessage: "Let's start with your phone number. Enter your phone number below:",
    vaccinationDateMessage: "Enter your preferred vaccination date (DD-MM-YYYY)",
    doseMessage: "Choose Dose number (1 or 2):",
    ageMessage: "Choose the age bracket (18 - 44 or 45+):",
    costMessage: "Choose the vaccine cost preference (Free or Paid):",
    stateMessage: "Choose your state of residence:",
    districtMessage: "Choose your district of residence:",
    preferredVaccineMessage: "Choose your preferred vaccine(s):",
    beneficiariesOtpMessage: "Please enter OTP for beneficiaries below:",
    beneficiariesMessage: "Select the beneficiaries for booking:",
    setupCompleteMessage: "You are all set! When you find out about an open slot, type /book. You will receive an OTP. Kindly enter the same to complete the booking!"
}

module.exports.commandMessages = {
    vaccinationDateMessage: "Enter your new preferred vaccination date (DD-MM-YYYY)",
    doseMessage: "Choose new Dose number (1 or 2):",
    ageMessage: "Choose the new age backet (18 - 44 or 45+):",
    costMessage: "Choose the updated vaccine cost preference (Free or Paid):",
    stateMessage: "Choose your new state of residence:",
    districtMessage: "Choose your new district of residence:",
    preferredVaccineMessage: "Choose your updated preferred vaccine(s):",
    beneficiariesOtpMessage: "Please enter OTP for updated beneficiaries below:",
    beneficiariesMessage: "Select the new beneficiaries for booking:",
    bookingOtpMessage: "Please enter OTP for booking slot below:",
    bookingErrorMessage: "There was an error in booking the slot. Starting search again . . ."
}

module.exports.preferredVaccines = ["COVAXIN", "COVISHIELD"]