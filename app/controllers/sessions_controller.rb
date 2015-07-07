class SessionsController < ApplicationController

	def new
	end

	def create
		@user = User.find_by email: user_params[:email]
		respond_to do |format|
	    if @user && @user.authenticate(user_params[:password])
	    	session[:user_id] = @user.id
	      format.html { redirect_to root_path, notice: 'Welcome.' }
	      format.json { render json: {status: :created, name: @user.first_name} }
	    else
	      format.html { render :new }
	      format.json { render json: {status: "failed to login"} }
	    end
    end
	end

	def destroy
		session[:user_id] = nil
		redirect_to root_path
	end

	private

    def user_params
      params.require(:session).permit(:email, :password)
    end

end