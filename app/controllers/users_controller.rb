class UsersController < ApplicationController

	before_action :set_user, only: [:show, :edit, :update]

	def show
	end

	def new
    @user = User.new
	end

	def edit
		@edit = true
	end

  def create
    @user = User.new(user_params)
    @code = BCrypt::Password.create(@user.email).gsub(/\/+|\.+|\$+/,"")
    @user.email_verification = @code
    respond_to do |format|
      if @user.save
        session[:user_id] = @user.id
        AuthMailer.email_verification_email(@user.email, @code).deliver
        format.html { redirect_to root_path, notice: 'Your account was successfully created, please verify your email.' }
        format.json { render json: {status: :created, name: @user.first_name} }
      else
        format.html { render :new }
        format.json { render json: {status: "failed to create account"} }
      end
    end
  end

  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to root_path, notice: 'Your account was successfully updated.' }
        format.json { render json: {status: :updated, name: @user.first_name} }
      else
        format.html { render :new }
        format.json { render json: {status: "failed to update your account"} }
      end
    end
  end

  def verification
    @user = User.find_by email_verification: params[:code]
    if @user
      @user.email_verification = "true"
      if @user.save
        @status = true
      else
        @status = false
      end
    else
      redirect_to root_path
    end
  end

  def verification_check
    p "*"*20
    p session[:user_id]
    p "*"*20
    theuser = User.find(session[:user_id])
    respond_to do |format|
      if theuser && theuser.email_verification == "true"
        format.json { render json: {status: true} }
      else
        format.json { render json: {status: "email not verified yet"} }
      end
    end
  end

  private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:email, :password, :first_name, :middle_name, :last_name)
    end

end