package mivhan;

import java.io.IOException;
public class main {

    public static void main(String[] args) {
        String stringToWrite = "Fixed String";
        final String FILE_NAME = "output";
        final String FORMAT = ".txt";


        try (FileWriter writer = new FileWriter(FILE_NAME + FORMAT)) {
            writer.write(stringToWrite);
            system.out.println("Fixed String had been written successfully");
        } catch (IOException e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
        }

    }

}