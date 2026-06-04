#include <cs50.h>
#include <ctype.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

bool validate_key(string key);

int main(int argc, string argv[])
{
    if (argc != 2)
    {
        printf("Usage: ./caesar key\n");
        return 1;
    }
    if (!validate_key(argv[1]))
    {
        printf("Key needs to contain 26 unique characters\n");
        return 1;
    }

    string plaintext = get_string("plaintext: ");

    int length = strlen(plaintext);

    string key = argv[1];

    char cyphertext[length + 1];

    for (int i = 0; i < length; i++)
    {
        if (islower(plaintext[i]))
        {
            int index = plaintext[i] - 97;

            cyphertext[i] = key[index];

            if (isupper(cyphertext[i]))
            {
                cyphertext[i] += 32;
            }
        }

        else if (isupper(plaintext[i]))
        {
            int index = plaintext[i] - 65;
            cyphertext[i] = key[index];
            if (islower(cyphertext[i]))
            {
                cyphertext[i] -= 32;
            }
        }
        else
        {
            cyphertext[i] = plaintext[i];
        }
    }
    cyphertext[length] = '\0';
    printf("cyphertext %s\n", cyphertext);
}

bool validate_key(string key)
{
    int length;

    length = strlen(key);

    if (length != 26)
    {
        printf("key needs 26 characters\n");
        return false;
    }

    for (int i = 0; i < length; i++)
    {
        if (!isalpha(key[i]))
        {
            printf("key needs to be all letters\n");
            return false;
        }
        for (int l = 0; l < length; l++)
        {
            key[i] = toupper(key[i]);
        }

        for (int j = i + 1; j < length; j++)
        {
            if (key[i] == key[j])
            {
                printf("key needs to be all unique letters\n");
                return false;
            }
        }
    }
    return true;
}
