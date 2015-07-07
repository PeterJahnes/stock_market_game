class SessionsController < ApplicationController

	def login
	end

	def loginp
	end

	def logout
		session[:user_id] = nil
		redirect_to root_path
	end

end