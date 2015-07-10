class AuthMailer < ActionMailer::Base
    default from: "do-not-reply@stockmarketgame.honovert.com"

    def email_verification_email(email, code)
        @code = code
        mail(to: email, subject: 'Email Verification Request')
    end
end