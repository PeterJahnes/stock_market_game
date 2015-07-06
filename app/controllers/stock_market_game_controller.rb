class StockMarketGameController < ApplicationController

	def index
	end

	def offset
		respond_to do |format|
			format.json { render json: {offset: Time.now.utc_offset}.to_json }
		end
	end

end