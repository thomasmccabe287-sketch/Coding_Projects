#include <ctype.h>
#include <cs50.h>
#include <stdio.h>
#include <string.h>

int POINTS[] = {1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10};

int compute_score(string answer);

int main(void)
{
    string answer1 = get_string("player 1: ");
    string answer2 = get_string("player 2: ");

    int score1 = compute_score(answer1);
    int score2 = compute_score(answer2);

    if (score1 > score2)
    {
        printf("Player 1 wins!\n");
    }
    else if(score1 < score2)
    {
         printf("Player 2 wins!\n");
    }
    else
    {
        printf("Tie!\n");
    }

}

int compute_score(string answer)
{
    int score = 0;

    for (int i = 0, len = strlen(answer); i < len; i++)
    {
        if (isupper(answer[i]))
        {
            score += POINTS[answer[i] - 'A'];
        }
         else if (islower(answer[i]))
        {
            score += POINTS[answer[i] - 'a'];
        }
    }
    return score;
}
