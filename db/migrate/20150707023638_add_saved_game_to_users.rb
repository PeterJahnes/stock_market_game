class AddSavedGameToUsers < ActiveRecord::Migration
  def change
  	add_column :users, :saved_game, :text
  end
end
