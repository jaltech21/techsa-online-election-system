class AddReferenceToVotes < ActiveRecord::Migration[8.0]
  def change
    add_column :votes, :reference, :string
  end
end
