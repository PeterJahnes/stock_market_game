class AuthMailer < ActionMailer::Base
  default from: ENV['DNR_FROM']

  def email_verification_email(email, code)
      @code = code
      mail(to: email, subject: 'Email Verification Request')
  end
end