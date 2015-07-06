class UsersController < ApplicationController

	before_action :set_user, only: [:show, :edit, :update, :destroy]

	def new
    @user = User.new
	end

	def edit
		@edit = true
	end

  def create
    @user = User.new(user_params)
    respond_to do |format|
      if @user.save
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

  private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:email, :password, :first_name, :middle_name, :last_name)
    end

end