module.exports.setupMessages = {
    initialMessage: `Welcome to Vaccine Buddy\\. Happy to assist you with booking your vaccination slot\\. I will be collecting the following details before assisting you:

    1\\. *Phone Number* \\- _For authentication purposes_
    2\\. *Vaccination Date* \\- _To filter slots by date_
    3\\. *Dose No* \\- _To filer slots by dose number_
    4\\. *Age* \\- _To filter slots by minimum age_
    5\\. *State* \\- _To filter slots by state_
    6\\. *District* \\- _To filter slots by district_
    7\\. *Vaccines* \\- _To filter by preferred vaccine\\(s\\)_
    8\\. *Beneficiaries* \\- _To identify members on your Cowin portal for the booking_
    
    While I will walk you through the steps one\\-by\\-one, you can change these preferences anytime by using the following commands:
    
    1\\. \`/age\` \\- _To change your age filter_
    2\\. \`/beneficiaries\` \\- _To change the relevant beneficiaries_
    3\\. \`/date\` \\- _To change your vaccination search start date_
    4\\. \`/dose\` \\- _To change your vaccination dose number_
    5\\. \`/state\` \\- _To change your state of residence_
    6\\. \`/district\` \\- _To change your district of residence_
    7\\. \`/vaccines\` \\- _To change your preferred vaccines_
        
    Hope I am able to assist you\\! Let's begin\\!`,
    phoneNumberMessage: "Let's start with your phone number. Enter your phone number below:",
    vaccinationDateMessage: "Enter your preferred vaccination date (DD-YY-MMMM)",
    doseMessage: "Choose Dose number (1 or 2):",
    ageMessage: "Choose the age bracket (18 - 44 or 45+):",
    stateMessage: "Choose your state of residence:",
    districtMessage: "Choose your district of residence:",
    preferredVaccineMessage: "Choose your preferred vaccine(s):",
    beneficiariesOtpMessage: "Please enter OTP for beneficiaries below:",
    beneficiariesMessage: "Select the beneficiaries for booking:",
    bookingOtpMessage: "Please enter OTP for booking slot below:",
    setupCompleteMessage: "You are all set! I will notify you when a slot is available. You will receive an OTP and a captcha image. Kindly enter the same to complete the booking!"
}

module.exports.commandMessages = {
    vaccinationDateMessage: "Enter your new preferred vaccination date (DD-YY-MMMM)",
    doseMessage: "Choose new Dose number (1 or 2):",
    ageMessage: "Choose the new age backet (18 - 44 or 45+):",
    stateMessage: "Choose your new state of residence:",
    districtMessage: "Choose your new district of residence:",
    preferredVaccineMessage: "Choose your updated preferred vaccine(s):",
    beneficiariesOtpMessage: "Please enter OTP for updated beneficiaries below:",
    beneficiariesMessage: "Select the new beneficiaries for booking:"
}

module.exports.preferredVaccines = ["COVAXIN", "COVISHIELD"]