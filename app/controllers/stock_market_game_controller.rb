class StockMarketGameController < ApplicationController

	include ApplicationHelper

	def index
		if !current_user
	    @user = User.new
	  end
	end

	def offset
		respond_to do |format|
			format.json { render json: {offset: Time.now.utc_offset}.to_json }
		end
	end


	def save
		if current_user
			p "#"*20
			p "*"*20
			saved_game = game_params[:saved_game]
			p "*"*20
			@user = current_user
			respond_to do |format|
				if @user.update(saved_game: saved_game)
					format.json { render json: {status: "success"}.to_json }
				else
					format.json { render json: {status: "failed to load game"}} 
				end
			end
		end
	end

	def load
		respond_to do |format|
			if current_user
				format.json { render json: {game: current_user.saved_game , stat: true}.to_json }
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