class StockMarketGameController < ApplicationController

	include ApplicationHelper

	def index
	  @user = User.new
	end

	def offset
		respond_to do |format|
			format.json { render json: {offset: Time.now.utc_offset}.to_json }
		end
	end


	def save
		respond_to do |format|
			if current_user && current_user.email_verification == "true"
				saved_game = game_params[:saved_game]
				@user = current_user
				if @user.update(saved_game: saved_game)
					format.json { render json: {status: "success"}.to_json }
				else
					format.json { render json: {status: "failed to load game"}}
				end
			else
				format.json { render json: {status: "you are not logged in"}}
			end
		end
	end

	def load
		respond_to do |format|
			if current_user && current_user.email_verification == "true"
				if current_user.saved_game
					format.json { render json: {game: current_user.saved_game , stat: true}.to_json }
				else
					format.json { render json: {status: "there is no game to load" , stat: false}.to_json }
				end
			else
				format.json { render json: {status: "failed to load game", stat: false} }
			end
		end
	end

	private

    def game_params
      params.require(:game).permit!
    end

end