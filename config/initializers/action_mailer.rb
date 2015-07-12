# Action Mailer
ActionMailer::Base.delivery_method = :smtp  
ActionMailer::Base.smtp_settings = {            
  address: ENV['DNR_ADDRESS'],
  port: ENV['DNR_PORT'],
  domain: ENV['DNR_DOMAIN'],
  user_name: ENV['DNR_USERNAME'],
  password: ENV['DNR_PASSWORD'],
  authentication: :plain,
  ssl: true
}